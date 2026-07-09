// Preset mặc định khi admin chọn 1 ngôn ngữ lần đầu — ví dụ chuẩn hoá "tính
// tổng 2 số" (solve(a, b) = a + b), đúng quy ước entry-point của sandbox
// (apps/api/src/modules/sandbox/infrastructure/services/docker-sandbox.service.ts)
// để đảm bảo chạy được ngay, admin chỉnh sửa lại theo đề thật của mình.

export const DEFAULT_TEMPLATES: Record<string, string> = {
  python: `class Solution:\n    def solve(self, a: int, b: int) -> int:\n        pass`,
  javascript: `function solve(a, b) {\n  // TODO\n}`,
  typescript: `function solve(a: number, b: number): number {\n  // TODO\n  return 0;\n}`,
  c: `int solve(int a, int b) {\n    // TODO\n    return 0;\n}`,
  cpp: `int solve(int a, int b) {\n    // TODO\n    return 0;\n}`,
  java: `class Solution {\n    int solve(int a, int b) {\n        // TODO\n        return 0;\n    }\n}`,
  go: `func solve(a int, b int) int {\n\t// TODO\n\treturn 0\n}`,
  rust: `fn solve(a: i32, b: i32) -> i32 {\n    // TODO\n    0\n}`,
  csharp: `int Solve(int a, int b) {\n    // TODO\n    return 0;\n}`,
  swift: `func solve(_ a: Int, _ b: Int) -> Int {\n    // TODO\n    return 0\n}`,
};

// {{STUDENT_CODE}} bị thay thế nguyên văn bằng nội dung admin/học sinh viết
// (judge.service.ts: wrapperCode.replace('{{STUDENT_CODE}}', sourceCode)),
// nên phải đặt đúng vị trí: sau các import cần thiết, trước nơi gọi hàm.
export const DEFAULT_WRAPPERS: Record<string, string> = {
  python: `import sys\ndata = sys.stdin.read().split()\na, b = int(data[0]), int(data[1])\n\n{{STUDENT_CODE}}\n\nprint(Solution().solve(a, b))`,

  javascript: `const data = require('fs').readFileSync(0, 'utf8').split(/\\s+/).filter(Boolean);\nconst a = parseInt(data[0], 10), b = parseInt(data[1], 10);\n\n{{STUDENT_CODE}}\n\nconsole.log(solve(a, b));`,

  typescript: `let __stdin = '';\nconst __decoder = new TextDecoder();\nfor await (const __chunk of Deno.stdin.readable) __stdin += __decoder.decode(__chunk, { stream: true });\nconst data = __stdin.trim().split(/\\s+/);\nconst a = parseInt(data[0], 10), b = parseInt(data[1], 10);\n\n{{STUDENT_CODE}}\n\nconsole.log(solve(a, b));`,

  c: `#include <stdio.h>\n\n{{STUDENT_CODE}}\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", solve(a, b));\n    return 0;\n}`,

  cpp: `#include <iostream>\nusing namespace std;\n\n{{STUDENT_CODE}}\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << solve(a, b) << endl;\n    return 0;\n}`,

  java: `import java.util.Scanner;\n\n{{STUDENT_CODE}}\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt(), b = sc.nextInt();\n        System.out.println(new Solution().solve(a, b));\n    }\n}`,

  go: `package main\n\nimport "fmt"\n\n{{STUDENT_CODE}}\n\nfunc main() {\n\tvar a, b int\n\tfmt.Scan(&a, &b)\n\tfmt.Println(solve(a, b))\n}`,

  rust: `use std::io::{self, Read};\n\n{{STUDENT_CODE}}\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    let mut it = input.split_whitespace();\n    let a: i32 = it.next().unwrap().parse().unwrap();\n    let b: i32 = it.next().unwrap().parse().unwrap();\n    println!("{}", solve(a, b));\n}`,

  csharp: `var line = Console.ReadLine()!.Split(' ');\nint a = int.Parse(line[0]), b = int.Parse(line[1]);\n\n{{STUDENT_CODE}}\n\nConsole.WriteLine(Solve(a, b));`,

  swift: `import Foundation\n\n{{STUDENT_CODE}}\n\nlet line = readLine()!.split(separator: " ")\nlet a = Int(line[0])!, b = Int(line[1])!\nprint(solve(a, b))`,
};
