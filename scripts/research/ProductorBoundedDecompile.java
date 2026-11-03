// Offline experiment: import with -noanalysis; never execute the target.
// Arguments: start end-exclusive output-directory. All addresses are hexadecimal.
// The candidate entry is analyst supplied; this script does not establish its name.
import ghidra.app.script.GhidraScript;
import ghidra.app.cmd.disassemble.DisassembleCommand;
import ghidra.app.decompiler.DecompInterface;
import ghidra.app.decompiler.DecompileResults;
import ghidra.program.model.address.Address;
import ghidra.program.model.address.AddressSet;
import ghidra.program.model.address.AddressRange;
import ghidra.program.model.listing.Function;
import ghidra.program.model.listing.Instruction;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;

public class ProductorBoundedDecompile extends GhidraScript {
    @Override
    public void run() throws Exception {
        String[] args = getScriptArgs();
        if (args.length != 3) throw new IllegalArgumentException("start end-exclusive output");
        Address start = toAddr(Long.parseUnsignedLong(args[0].replace("0x", ""), 16));
        Address end = toAddr(Long.parseUnsignedLong(args[1].replace("0x", ""), 16));
        if (end.compareTo(start) <= 0 || end.subtract(start) > 65536)
            throw new IllegalArgumentException("range must contain 1..65536 bytes");
        Path output = Path.of(args[2]);
        Files.createDirectories(output);
        AddressSet permitted = new AddressSet(start, end.subtract(1));
        DisassembleCommand command = new DisassembleCommand(start, permitted, true);
        if (!command.applyTo(currentProgram, monitor))
            throw new IllegalStateException("Disassembly failed: " + command.getStatusMsg());
        Function function = createFunction(start, "bounded_candidate_" + start);
        if (function == null) function = getFunctionAt(start);
        if (function == null) throw new IllegalStateException("No function at requested entry");
        if (!permitted.contains(function.getBody()))
            throw new IllegalStateException("Function body escaped the requested range");
        StringBuilder assembly = new StringBuilder();
        int instructions = 0;
        for (Instruction instruction : currentProgram.getListing().getInstructions(function.getBody(), true)) {
            assembly.append(instruction.getAddress()).append(" ").append(instruction).append("\n");
            instructions++;
        }
        Files.writeString(output.resolve("bounded.asm.txt"), assembly, StandardCharsets.UTF_8);
        StringBuilder ranges = new StringBuilder("start\tend_inclusive\tbytes\tloaded_sha256\n");
        for (AddressRange range : function.getBody().getAddressRanges()) {
            byte[] bytes = new byte[(int) range.getLength()];
            if (currentProgram.getMemory().getBytes(range.getMinAddress(), bytes) != bytes.length)
                throw new IllegalStateException("Incomplete body range read");
            ranges.append(range.getMinAddress()).append("\t").append(range.getMaxAddress())
                .append("\t").append(bytes.length).append("\t")
                .append(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)))
                .append("\n");
        }
        Files.writeString(output.resolve("body-ranges.tsv"), ranges, StandardCharsets.UTF_8);
        DecompInterface decompiler = new DecompInterface();
        try {
            decompiler.toggleCCode(true);
            decompiler.toggleSyntaxTree(false);
            if (!decompiler.openProgram(currentProgram))
                throw new IllegalStateException(decompiler.getLastMessage());
            DecompileResults result = decompiler.decompileFunction(function, 45, monitor);
            boolean complete = result.decompileCompleted() && result.getDecompiledFunction() != null;
            if (complete) Files.writeString(output.resolve("bounded.pseudo.c.txt"),
                result.getDecompiledFunction().getC(), StandardCharsets.UTF_8);
            String report = "entry=" + start + "\nend_exclusive=" + end +
                "\nprogram_sha256=" + currentProgram.getExecutableSHA256() +
                "\nbody_addresses=" + function.getBody().getNumAddresses() +
                "\nbody_ranges=" + function.getBody().getNumAddressRanges() +
                "\ninstructions=" + instructions + "\ndecompile_completed=" + complete +
                "\nerror=" + result.getErrorMessage() +
                "\nlimitations=No global analysis; analyst supplied entry; unknown callees and types; " +
                "pseudocode is not source or verified behavior.\n";
            Files.writeString(output.resolve("bounded-result.txt"), report, StandardCharsets.UTF_8);
            println(report);
        } finally {
            decompiler.dispose();
        }
    }
}
