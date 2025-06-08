document.addEventListener("DOMContentLoaded", function () {
  // Create the "Translate to Arabic" button
  const translateButton = document.createElement("button");
  translateButton.innerText = "Translate to Arabic (Beta)";
  translateButton.classList.add("button", "btn-primary"); // Django admin button styling
  translateButton.style.margin = "10px";
  translateButton.style.padding = "10px";
  translateButton.style.maxHeight = "40px";
  translateButton.type = "button";
  const englishInput = document.querySelector("#id_en");

  // Insert the button into the form
  englishInput.parentNode.append(translateButton);

  // Add button click event listener
  translateButton.addEventListener("click", function () {
    const englishInput = document.querySelector("#id_en");
    const arabicInput = document.querySelector("#id_ar");

    if (!englishInput.value) {
      alert("Please enter English text.");
      return;
    }

    // Add loading state
    translateButton.disabled = true;
    translateButton.innerText = "Translating...";

    // Make API call to MyMemory API
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishInput.value)}&langpair=en|ar`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.responseData) {
          arabicInput.value = data.responseData.translatedText; // Populate the Arabic text field
        } else {
          alert("Translation failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while fetching the translation.");
      })
      .finally(() => {
        // Reset button state
        translateButton.disabled = false;
        translateButton.innerText = "Translate to Arabic (Beta)";
      });
  });
});
