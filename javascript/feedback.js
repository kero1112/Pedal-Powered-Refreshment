// feedback.js - ginamit dito yung validation ng form sa unit 7, then Show saved feedback gamit yung DOM, so dito pumapasok yung Unit 6.
const FEEDBACK_KEY = "caseStudyFeedback";
const form = document.getElementById("feedbackForm");
const nameInput = document.getElementById("fbName");
const emailInput = document.getElementById("fbEmail");
const topicInput = document.getElementById("fbTopic");
const messageInput = document.getElementById("fbMessage");
const charCount = document.getElementById("charCount");
const ratingText = document.getElementById("ratingText");
const formMessage = document.getElementById("formMessage");
const feedbackList = document.getElementById("feedbackList");
const stars = document.querySelectorAll(".star");
const ratingNames = ["", "Not good", "Okay", "Good", "Very tasty", "Loved it"];
let rating = 3;

const showStars = () => {
  stars.forEach((star, index) => {
    star.className = index < rating ? "star star-on" : "star";
  });
  ratingText.textContent = `${rating} of 5 stars · ${ratingNames[rating]}`;
};

stars.forEach((star, index) => {
  star.addEventListener("click", () => {
    rating = index + 1;
    showStars();
  });
});

messageInput.addEventListener("input", () => {
  charCount.textContent = `${600 - messageInput.value.length} characters left`;
});

const setError = (id, message) => {
  document.getElementById(id).textContent = message;
};

const loadFeedback = () => {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const saveFeedback = (items) => {
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items));
  } catch (error) {
    // storage is not available
  }
};

// eto yung feedback list sa baba ng form
const showFeedbacks = () => {
  const items = loadFeedback();
  feedbackList.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-text";
    empty.textContent = "No feedback yet. Be the first to tell us about your sip!";
    feedbackList.appendChild(empty);
    return;
  }
  items.forEach((item, index) => {
    const box = document.createElement("div");
    box.className = "feedback-item";

    const top = document.createElement("div");
    top.className = "feedback-top";
    const who = document.createElement("strong");
    who.textContent = item.name;
    const starText = document.createElement("span");
    starText.className = "feedback-stars";
    starText.textContent = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);
    top.appendChild(who);
    top.appendChild(starText);

    const meta = document.createElement("p");
    meta.className = "feedback-meta";
    meta.textContent = `${item.topic} · ${item.date}`;

    const text = document.createElement("p");
    text.className = "feedback-text";
    text.textContent = item.message;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-btn";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      if (confirm("Remove this feedback?")) {
        saveFeedback(loadFeedback().filter((entry, position) => position !== index));
        showFeedbacks();
      }
    });

    box.append(top, meta, text, removeButton);
    feedbackList.appendChild(box);
  });
};

// Validation ng RegEx and if statements(nasa unit 7 to so aralin nyo)
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  let isValid = true;

  if (!/^[A-Za-z][A-Za-z .'-]{2,}$/.test(name)) {
    setError("nameError", "Please enter your name (letters only, at least 3 characters).");
    isValid = false;
  } else {
    setError("nameError", "");
  }
  if (email !== "" && !/^\S+@\S+\.\S+$/.test(email)) {
    setError("emailError", "Please enter a valid email like juan@email.com.");
    isValid = false;
  } else {
    setError("emailError", "");
  }
  if (message.length < 10) {
    setError("messageError", "Your message must be at least 10 characters.");
    isValid = false;
  } else {
    setError("messageError", "");
  }
  if (!isValid) {
    formMessage.textContent = "";
    return;
  }

  const date = new Date().toLocaleDateString();
  saveFeedback([...loadFeedback(), { name, email, topic: topicInput.value, rating, message, date }]);
  formMessage.textContent = `Thank you, ${name}! Your feedback was added below.`;
  form.reset();
  rating = 3;
  showStars();
  charCount.textContent = "600 characters left";
  showFeedbacks();
});

showStars();
showFeedbacks();
