const form = document.querySelector<HTMLFormElement>("#import-form")!;
const handleInput = document.querySelector<HTMLInputElement>("#handle")!;
const statusElement = document.querySelector<HTMLElement>("#status")!;

handleInput.value = localStorage.getItem("codeforcesHandle") ?? "";

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const handle = handleInput.value.trim();
  if (!handle) {
    statusElement.textContent = "Enter your Codeforces handle.";
    return;
  }
  localStorage.setItem("codeforcesHandle", handle);
  statusElement.textContent = `Saved ${handle}. Import is not connected yet; no history was collected.`;
});
