// The reporter sends a test's final result about a second after it finishes,
// and loses the last one if the run ends first (ENG-1729). The run then waits
// for its inactivity timeout. Waiting here lets that result go out.
export default async function teardown() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
