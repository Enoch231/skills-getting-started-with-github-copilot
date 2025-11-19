document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Small helper to escape HTML before inserting into innerHTML
  function escapeHTML(str) {
    if (typeof str !== "string") return str;
    return str.replace(/[&<>"']/g, (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s])
    );
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear and reset select to avoid duplicate options on reload
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Basic content
        activityCard.innerHTML = `
          <h4>${escapeHTML(name)} <span class="badge">${details.participants.length}</span></h4>
          <p>${escapeHTML(details.description)}</p>
          <p><strong>Schedule:</strong> ${escapeHTML(details.schedule)}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsDiv = document.createElement("div");
        participantsDiv.className = "participants";

        const participantsHeader = document.createElement("h5");
        participantsHeader.textContent = "Participants";
        participantsDiv.appendChild(participantsHeader);

        if (Array.isArray(details.participants) && details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.style.listStyleType = "none";
          ul.style.paddingLeft = "0";
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.alignItems = "center";
            // Participant email
            const span = document.createElement("span");
            span.textContent = p;
            li.appendChild(span);
            // Delete icon
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "&#128465;"; // Trash can emoji
            deleteBtn.title = "Unregister participant";
            deleteBtn.style.marginLeft = "8px";
            deleteBtn.style.background = "none";
            deleteBtn.style.border = "none";
            deleteBtn.style.color = "#c62828";
            deleteBtn.style.cursor = "pointer";
            deleteBtn.style.fontSize = "1.1em";
            deleteBtn.addEventListener("click", async () => {
              if (confirm(`Unregister ${p} from ${name}?`)) {
                try {
                  const response = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, { method: "POST" });
                  if (response.ok) {
                    fetchActivities();
                  } else {
                    alert("Failed to unregister participant.");
                  }
                } catch (err) {
                  alert("Error unregistering participant.");
                }
              }
            });
            li.appendChild(deleteBtn);
            ul.appendChild(li);
          });
          participantsDiv.appendChild(ul);
        } else {
          const noP = document.createElement("p");
          noP.className = "no-participants";
          noP.textContent = "No participants yet";
          participantsDiv.appendChild(noP);
        }

        activityCard.appendChild(participantsDiv);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities so participants and availability update immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
