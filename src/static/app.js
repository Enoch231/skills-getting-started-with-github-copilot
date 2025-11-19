document.addEventListener('DOMContentLoaded', () => {
  const activitiesListEl = document.getElementById('activities-list');
  const activityTemplate = document.getElementById('activity-template');
  const activitySelect = document.getElementById('activity');
  const signupForm = document.getElementById('signup-form');
  const emailInput = document.getElementById('email');
  const messageEl = document.getElementById('message');

  // Sample activities data; in a real app this would come from a server.
  const activities = [
    { id: 'chess', name: 'Chess Club', description: 'Strategy, tournaments, and fun.', schedule: 'Wed 3:30pm', participants: ['alice@mergington.edu'] },
    { id: 'robotics', name: 'Robotics Team', description: 'Build and program robots.', schedule: 'Tue & Thu 4:00pm', participants: [] },
    { id: 'art', name: 'Art Workshop', description: 'Drawing, painting & mixed media.', schedule: 'Mon 3:00pm', participants: ['jordan@mergington.edu','sam@mergington.edu'] }
  ];

  function renderActivities() {
    activitiesListEl.innerHTML = '';
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    activities.forEach(act => {
      // populate select
      const opt = document.createElement('option');
      opt.value = act.id;
      opt.textContent = act.name;
      activitySelect.appendChild(opt);

      // render card from template
      const clone = activityTemplate.content.cloneNode(true);
      const card = clone.querySelector('.activity-card');
      clone.querySelector('.activity-name').textContent = act.name;
      clone.querySelector('.activity-meta').textContent = act.schedule || '';
      clone.querySelector('.activity-description').textContent = act.description || '';

      const countEl = clone.querySelector('.participants .count');
      const ul = clone.querySelector('.participants-list');
      ul.innerHTML = '';

      if (act.participants && act.participants.length > 0) {
        act.participants.forEach(email => {
          const li = document.createElement('li');
          li.textContent = email;
          ul.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.textContent = 'No participants yet — be the first!';
        li.classList.add('empty');
        ul.appendChild(li);
      }
      countEl.textContent = `(${act.participants.length})`;

      activitiesListEl.appendChild(card);
    });
  }

  signupForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const email = (emailInput.value || '').trim();
    const activityId = activitySelect.value;

    if (!email || !activityId) {
      showMessage('Please provide an email and select an activity.', 'error');
      return;
    }

    const act = activities.find(a => a.id === activityId);
    if (!act) {
      showMessage('Selected activity not found.', 'error');
      return;
    }

    if (act.participants.includes(email)) {
      showMessage('You are already signed up for this activity.', 'warning');
      return;
    }

    act.participants.push(email);
    renderActivities();
    signupForm.reset();
    showMessage(`Signed up ${email} for ${act.name}.`, 'success');
  });

  function showMessage(text, kind = 'info') {
    messageEl.className = '';
    messageEl.classList.add(kind);
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => messageEl.classList.add('hidden'), 4000);
  }

  // initial render
  renderActivities();
});
