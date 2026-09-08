import readline from "node:readline";

export function infoMessage(message: string) {
  console.log("\x1b[36m%s\x1b[0m", message);
}

export function errorMessage(message: string) {
  console.log("\x1b[31m%s\x1b[0m", message);
}

export function successMessage(message: string) {
  console.log("\x1b[32m%s\x1b[0m", message);
}

export function warningMessage(message: string) {
  console.log("\x1b[33m%s\x1b[0m", message);
}

export async function inputMessage(question: string, defaultValue?: string) {
  return new Promise<string>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const promptedQuestion = !defaultValue
      ? `${question} `
      : `${question} (${defaultValue}) `;

    rl.question(promptedQuestion, function (answer) {
      rl.close();
      resolve(answer ? answer : defaultValue || "");
    });
  });
}
