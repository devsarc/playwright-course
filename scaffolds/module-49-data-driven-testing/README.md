# M49: Data-Driven Testing

## Learning Objectives

- Use `test.describe()` with a data array loop to generate multiple parametrized test cases from a single test body
- Load test data from an external JSON file instead of embedding it inline
- Name parametrized tests clearly so failures identify which data combination caused the problem
- Recognize when data-driven tests add value and when they obscure intent

## Concept

Some tests exist to verify a behavior across multiple inputs. A form validation test might need to confirm that ten different invalid inputs each produce the correct error message. A task creation test might need to verify that tasks with different priorities, labels, and column assignments all render correctly. Writing ten copies of the same test body is tedious and creates maintenance overhead. Data-driven testing solves this by separating the test logic from the test data.

**The `test.describe()` loop pattern.** The most direct approach: call `test.describe()` once per data case inside a loop, or call `test()` directly in a loop. Playwright generates one test per iteration, each with its own pass/fail result:

```
const cases = [
  { input: 'a', expected: 'error: too short' },
  { input: '', expected: 'error: required' },
];

for (const { input, expected } of cases) {
  test(`validates input: "${input}"`, async ({ page }) => {
    // ...
  });
}
```

Each generated test appears as a separate row in the HTML report. If two pass and one fails, the report shows exactly which case failed. This is the core value: individual failure identification.

**Naming matters.** The test name is the only thing visible in a failure report outside the stack trace. A test named `test('validates form', ...)` in a loop produces `validates form`, `validates form`, `validates form` — indistinguishable from each other. A test named with the discriminating data values — `test('validates input: "${input}"', ...)` — produces immediately actionable failure messages.

**External data files.** When test cases grow large or are shared with non-engineers (product, QA, content teams who write test scenarios in spreadsheets), moving data to an external JSON file decouples the data from the code. The test file imports the JSON, iterates over it, and generates test cases. Updating the data doesn't require changing any TypeScript. The JSON lives in the same directory as the spec or in a dedicated `fixtures/data/` folder.

**When data-driven tests add value.** Data-driven tests make sense when: the behavior is identical across all cases (same actions, same assertion shape), the discriminating factor is the input data, there are enough cases that writing them individually would be repetitive, and different team members might contribute new cases over time by editing the JSON. They are not appropriate when: each "case" actually tests a meaningfully different scenario (use separate named tests instead), when the data drives not just inputs but the shape of the test logic, or when having one test is just a disguise for skipping thinking about what each case is actually verifying.

**The `test.describe()` approach vs. flat `test()` loop.** Wrapping each case in `test.describe()` adds a nesting level in the report — useful for large test suites where you want to group cases under a label. For smaller datasets, a flat `test()` loop is simpler. Both approaches produce the same behavior; the difference is organizational.

**Parametrized fixtures vs. data-driven loops.** These are different tools for different problems. Parametrized fixtures change the setup context for a test (e.g., run with different user roles). Data-driven loops change the inputs and expected outputs within a test body. Use fixtures when the variation is in the environment; use loops when the variation is in the data.

## Lumio Context

See `lumio-context.md`.

## Step-by-Step Tasks

Complete each TODO in `exercise.spec.ts` in order.
```bash
npx playwright test tests/module-49-data-driven-testing
```

## Key Takeaways

1. Loop over a data array inside `test.describe()` or at the top level to generate one test per case.
2. Include the discriminating data in the test name so failures are immediately identifiable.
3. Move large or shared datasets to external JSON files — decouple data from code.
4. Data-driven tests add value when behavior is identical across cases; separate tests add value when scenarios differ meaningfully.
5. Prefer descriptive case names over generic indices — `"priority: high"` beats `"case 3"`.

## Going Deeper

- [Playwright docs: Parametrize tests](https://playwright.dev/docs/test-parameterize)
- [Playwright docs: test.describe()](https://playwright.dev/docs/api/class-test#test-describe)
- [Playwright docs: Projects for parametrization](https://playwright.dev/docs/test-projects)
