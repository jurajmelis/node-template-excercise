import fs, { PathLike } from "fs";
import path from "path";

export function transformStringToNumber(array: string[]): any[] {
  return array.map(value => {
    return Number(value) ? Number(value) : value;
  });
}

export async function getFilesFromFolder(folder: string): Promise<string[]> {
  const filePath: PathLike = path.join(__dirname, folder);
  try {
    const files = await fs.promises.readdir(filePath);
    const csvFiles = files.filter(file => {
      return path.extname(file).toLowerCase() === ".csv";
    });
    return await Promise.resolve(csvFiles);
  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
}

export function checkDigitInString(check: string): boolean {
  return check.match("[0-9]") ? true : false
}
