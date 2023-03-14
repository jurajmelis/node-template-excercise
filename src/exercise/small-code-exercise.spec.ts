import * as exercise from "./small-code-exercise";

describe("small-code-exercise", () => {
    describe(".transformStringToNumber", () => {
        it("returned transformed array containing number and strings", () => {
            const result = exercise.transformStringToNumber(["super", "20.5", "test", "23"]);
            expect.arrayContaining(result);
            expect(result).toEqual(["super", 20.5, "test", 23]);
        });
        describe(".getFilesFromFolder", () => {
            it("return an array of all files with csv extension in folder /files", async () => {
                const result = await exercise.getFilesFromFolder("../../files");
                expect.arrayContaining(result);
                expect(result).toEqual(["export.csv", "import.csv"]);
            });
            it("return empty array when path argument is not specified", async () => {
                const result = await exercise.getFilesFromFolder("");
                expect(result).toEqual([]);
            });
        });
        describe(".getFilesFromFolder", () => {
            it("return boolean value if a string contains a digit", () => {
                const result1 = exercise.checkDigitInString("test-string");
                expect(result1).toEqual(false);

                const result2 = exercise.checkDigitInString("test-string23");
                expect(result2).toEqual(true);
            });
        });
    });
});
