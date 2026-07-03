export const DEFAULT_TEMPLATES = {
  python: `def greet(name):\n    print(f"Hello, {name}!")\n\nname = input()\ngreet(name)`,
  javascript: `const readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.question('', (name) => {\n    console.log(\`Hello, \${name}!\`);\n    rl.close();\n});`,
  c: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char name[100];\n    if (fgets(name, sizeof(name), stdin)) {\n        // Strip newline\n        name[strcspn(name, "\\n")] = 0;\n        printf("Hello, %s!\\n", name);\n    }\n    return 0;\n}`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextLine()) {\n            String name = scanner.nextLine();\n            System.out.println("Hello, " + name + "!");\n        }\n        scanner.close();\n    }\n}`,
  go: `package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n    "strings"\n)\n\nfunc main() {\n    reader := bufio.NewReader(os.Stdin)\n    name, _ := reader.ReadString('\\n')\n    name = strings.TrimSpace(name)\n    fmt.Printf("Hello, %s!\\n", name)\n}`,
  csharp: `using System;\n\nclass Program {\n    static void Main() {\n        string name = Console.ReadLine();\n        Console.WriteLine($"Hello, {name}!");\n    }\n}`,
  cpp: `#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    if (std::getline(std::cin, name)) {\n        std::cout << "Hello, " << name << "!" << std::endl;\n    }\n    return 0;\n}`,
  rust: `use std::io::{self, BufRead};\n\nfn main() {\n    let stdin = io::stdin();\n    let mut iterator = stdin.lock().lines();\n    if let Some(Ok(name)) = iterator.next() {\n        println!("Hello, {}!", name.trim());\n    }\n}`,
  typescript: `// Deno standard reading from stdin\nconst buf = new Uint8Array(1024);\nconst n = await Deno.stdin.read(buf);\nif (n !== null) {\n  const name = new TextDecoder().decode(buf.subarray(0, n)).trim();\n  console.log(\`Hello, \${name}!\`);\n}`,
  swift: `if let name = readLine() {\n    print("Hello, \\(name)!")\n}`,
};
