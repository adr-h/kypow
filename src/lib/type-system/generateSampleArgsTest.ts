import { Project } from "ts-morph";
import { generateSampleArgs } from "./generateSampleArgsPoc";

export function testSampleArguments(
   code: string,
   functionName: string
): string[] {
   const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
         // without this, "isNUllable" does not work as expected (e.g: always collapses `number | null` to `null` and returns false for isNullable)
         strictNullChecks: true

      }
   });
   project.createSourceFile("test.ts", code);

   return generateSampleArgs({
      tsProject: project,
      sourceFile: "test.ts",
      functionName: "sampleFunc"
   });
}

console.log(
   JSON.stringify(

      testSampleArguments(
         `
            enum Direction {
               Up = "UP",
               Down = "DOWN",
               Left = "LEFT",
               Right = "RIGHT",
            }

            enum Compass {
               north, south, east, west
            }

            type SampleFuncRequiredProp = {
               age: number;
               name: string;
               friends: string[];
               direction: Direction;
               compass: Compass;
               wazoo: Address & { ping: "pong" }
               ancestors: SampleFuncRequiredProp[];
            }

            type Address = {
               road: string;
               nextNeighbour: Address | null;
               previousNeighbour?: Address;
               completionDate: Date;
            }

            type OptionalProp = {
               home: Address;
               ping: "pong";
               bah?: Record<number, OptionalProp>;
            }
            // function sampleFunc(a: SampleFuncRequiredProp) {}
            function sampleFunc(a: SampleFuncRequiredProp, o?: OptionalProp) {}
         `,
         "sampleFunc"
      ), null, 2
   )
)