/** Suplemento de investigación FI/FS desde una copia anual verificada; nunca abre originales. */
import com.healthmarketscience.jackcess.*;
import java.nio.file.*;
import java.io.*;
import java.security.*;
import java.util.*;

class ExtraerPerfilesAdicionales {
  static String hash(Path file) throws Exception {
    MessageDigest digest = MessageDigest.getInstance("SHA-256");
    try (InputStream in = Files.newInputStream(file)) {
      byte[] bytes = new byte[65536];
      for (int n; (n = in.read(bytes)) > 0;) digest.update(bytes, 0, n);
    }
    return HexFormat.of().formatHex(digest.digest());
  }
  static String quote(Object value) {
    String text = value == null ? "" : value instanceof Boolean ? ((Boolean)value ? "True" : "False") : value.toString();
    return "\"" + text.replace("\"", "\"\"") + "\"";
  }
  public static void main(String[] args) throws Exception {
    if (args.length != 3) throw new IllegalArgumentException("copia.mdb sha256 destino-output");
    Path root = Path.of("output").toRealPath(), copy = Path.of(args[0]).toRealPath();
    Path destination = Path.of(args[2]).toAbsolutePath().normalize();
    if (!copy.startsWith(root) || !copy.getFileName().toString().equals("copia.mdb") || !destination.startsWith(root))
      throw new IllegalArgumentException("Solo copia y destino dentro de output");
    if (!hash(copy).equalsIgnoreCase(args[1])) throw new IllegalStateException("Hash distinto del manifest");
    Files.createDirectories(destination);
    try (Database db = new DatabaseBuilder(copy.toFile()).setReadOnly(true).open()) {
      for (String name : List.of("EstructurasDiseño", "VDatosLinDetDis", "SeriesPerfiles", "ConfigSeriesCotas")) {
        Table table = db.getTable(name);
        List<String> columns = table.getColumns().stream().map(Column::getName).toList();
        try (BufferedWriter out = Files.newBufferedWriter(destination.resolve(name + ".csv"))) {
          out.write(String.join(",", columns.stream().map(ExtraerPerfilesAdicionales::quote).toList())); out.newLine();
          for (Row row : table) {
            out.write(String.join(",", columns.stream().map(c -> quote(row.get(c))).toList())); out.newLine();
          }
        }
        System.out.println(name + ": " + table.getRowCount());
      }
    }
    if (!hash(copy).equalsIgnoreCase(args[1])) throw new IllegalStateException("La copia cambio durante lectura");
    Files.writeString(destination.resolve("suplemento.sha256"), args[1].toLowerCase() + "\n");
  }
}
