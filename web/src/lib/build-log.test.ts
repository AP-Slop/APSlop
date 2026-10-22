import { describe, expect, it } from "vitest";
import { extractBuildErrors } from "./build-log";

const ts = "2026-10-22T10:10:18.3176261Z ";
const kotlinFailure = [
  `${ts}> Task :app:preBuild UP-TO-DATE`,
  `${ts}> Task :app:checkDebugDuplicateClasses`,
  `${ts}`,
  `${ts}e: file:///home/runner/work/cafeteria-review/cafeteria-review/app/src/main/java/dev/apslop/apps/cafeteria_review/data/ReviewStore.kt:24:9 Platform declaration clash: The following declarations have the same JVM signature (setAuthorName(Ljava/lang/String;)V):`,
  `${ts}    fun \`<set-authorName>\`(\`<set-?>\`: String): Unit defined in dev.apslop.apps.cafeteria_review.data.ReviewStore`,
  `${ts}> Task :app:compileDebugKotlin`,
  `${ts}    fun setAuthorName(name: String): Unit defined in dev.apslop.apps.cafeteria_review.data.ReviewStore`,
  `${ts}`,
  `${ts}> Task :app:compileDebugKotlin FAILED`,
  `${ts}> Task :app:mergeExtDexDebug`,
  `${ts}21 actionable tasks: 21 executed`,
  `${ts}FAILURE: Build failed with an exception.`,
  `${ts}`,
  `${ts}* What went wrong:`,
  `${ts}Execution failed for task ':app:compileDebugKotlin'.`,
  `${ts}> A failure occurred while executing org.jetbrains.kotlin.compilerRunner.GradleCompilerRunnerWithWorkers$GradleKotlinCompilerWorkAction`,
  `${ts}   > Compilation error. See log for more details`,
  `${ts}`,
  `${ts}* Try:`,
  `${ts}> Run with --stacktrace option to get the stack trace.`,
].join("\n");

describe("extractBuildErrors", () => {
  it("keeps the compiler errors, their continuation lines and what went wrong, with repository paths", () => {
    const out = extractBuildErrors(kotlinFailure);
    expect(out).toContain("e: app/src/main/java/dev/apslop/apps/cafeteria_review/data/ReviewStore.kt:24:9 Platform declaration clash");
    expect(out).toContain("    fun setAuthorName(name: String): Unit defined in");
    expect(out).toContain("> Task :app:compileDebugKotlin FAILED");
    expect(out).toContain("* What went wrong:\nExecution failed for task ':app:compileDebugKotlin'.");
    expect(out).toContain("   > Compilation error. See log for more details");
    expect(out).not.toContain("UP-TO-DATE");
    expect(out).not.toContain("--stacktrace");
    expect(out).not.toContain("2026-10-22T");
    expect(out).not.toContain("/home/runner/");
  });

  it("keeps failed tests and resource errors", () => {
    const out = extractBuildErrors(
      [
        `${ts}ExampleUnitTest > addition_isCorrect FAILED`,
        `${ts}    java.lang.AssertionError at ExampleUnitTest.kt:9`,
        `${ts}2 tests completed, 1 failed`,
        `${ts}/home/runner/work/r/r/app/src/main/res/values/strings.xml:4: error: resource string/greeting (aka dev.apslop.apps.r:string/greeting) not found.`,
      ].join("\n"),
    );
    expect(out).toContain("ExampleUnitTest > addition_isCorrect FAILED\n    java.lang.AssertionError at ExampleUnitTest.kt:9");
    expect(out).toContain("app/src/main/res/values/strings.xml:4: error: resource string/greeting");
    expect(out).not.toContain("2 tests completed");
  });

  it("falls back to the tail of a log without recognizable errors", () => {
    const log = Array.from({ length: 60 }, (_, i) => `${ts}line ${i}`).join("\n");
    const out = extractBuildErrors(log);
    expect(out.split("\n")).toHaveLength(40);
    expect(out).toContain("line 59");
    expect(out).not.toContain("line 19\n");
  });

  it("cuts a very long error list and says how much is left", () => {
    const log = Array.from({ length: 150 }, (_, i) => `${ts}e: F.kt:${i}:1 bad`).join("\n");
    const out = extractBuildErrors(log);
    expect(out.split("\n")).toHaveLength(121);
    expect(out).toMatch(/… \(30 more lines\)$/);
  });
});
