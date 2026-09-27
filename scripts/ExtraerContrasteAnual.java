/** Exportación de una copia verificada; Jackcess se proporciona en el classpath. */
import com.healthmarketscience.jackcess.*;
import java.nio.file.*;
import java.io.*;
import java.security.*;
import java.util.*;

class ExtraerContrasteAnual {
  static String hash(Path path) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    try (InputStream in = Files.newInputStream(path)) {
      byte[] buffer = new byte[65536];
      for (int n; (n = in.read(buffer)) > 0;) digest.update(buffer, 0, n);
    }
    return HexFormat.of().formatHex(digest.digest());
  }
  static String quote(Object value) {
    String text = value == null ? "" : value instanceof Boolean ?
      ((Boolean)value ? "True" : "False") : value.toString();
    return "\"" + text.replace("\"", "\"\"") + "\"";
  }
  public static void main(String[] args) throws Exception {
    if (args.length != 3) throw new IllegalArgumentException("copia.mdb sha256 destino-output");
    Path copy = Path.of(args[0]).toRealPath();
    Path outputRoot = Path.of("output").toRealPath();
    Path destination = Path.of(args[2]).toAbsolutePath().normalize();
    if (!copy.startsWith(outputRoot) || !copy.getFileName().toString().equals("copia.mdb"))
      throw new IllegalArgumentException("Solo copia.mdb dentro de output");
    if (!destination.startsWith(outputRoot)) throw new IllegalArgumentException("Destino fuera de output");
    if (!hash(copy).equalsIgnoreCase(args[1])) throw new IllegalStateException("Hash de copia distinto del manifest");
    Files.createDirectories(destination);
    // Se vuelven a extraer las tablas consumidas para vincular la evidencia al hash de la copia.
    String[] tables = ("Estructuras,EstructurasArticulos,MOConceptos,MOCategorias,Conjuntos,ConjuntosLin," +
      "ConjuntosDescuentos,ConjuntosAsoc,ConjuntosOpcionesHerraje,FamiliasGruposAsoc," +
      "SeriesAsocV2TiposHoja,TAcristalamientoLin,Articulos,ArticulosPVP,ArticulosIncrPrecio," +
      "VDatosLinEstr,VConceptosMO,VPresupuestosLin,VPresupuestos,VOpcionesHerraje,VMedidasDA,EstructurasDA").split(",");
    try (Database db = new DatabaseBuilder(copy.toFile()).setReadOnly(true).open()) {
      for (String name : tables) {
        Table table = db.getTable(name);
        List<String> columns = name.equals("VPresupuestos") ? List.of("Id", "Numero", "Fecha", "Tarifa") :
          table.getColumns().stream().map(Column::getName).toList();
        try (BufferedWriter out = Files.newBufferedWriter(destination.resolve(name + ".csv"))) {
          out.write(String.join(",", columns.stream().map(ExtraerContrasteAnual::quote).toList())); out.newLine();
          for (Row row : table) {
            out.write(String.join(",", columns.stream().map(c -> quote(row.get(c))).toList())); out.newLine();
          }
        }
        System.out.println(name + ": " + table.getRowCount());
      }
    }
    if (!hash(copy).equalsIgnoreCase(args[1])) throw new IllegalStateException("La copia cambio durante lectura");
    Files.writeString(destination.resolve("fuente.sha256"), args[1].toLowerCase() + "\n");
  }
}
