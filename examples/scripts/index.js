const renderNews = async () => {
  const response = await fetch("../database/news.json");
  try {
    if (response.status === 200) {
      const news = await response.json();
      const newsContainer = document.createElement('div');
      newsContainer.classList.add('news-list');

      news.forEach((n) => {
        const newsDiv = document.createElement('div');
        newsDiv.classList.add('news-item', 'news-item-short');
        newsDiv.innerHTML = `<h2>${n.title}<span class="news-item-date">${(new Date(n.date)).toLocaleString(['GBP'], { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></h2><div class="news-item-text">${n.text}</div><span class="news-item-expand-button">More...</span><i class="news-item-liked">♥ ${n.likes}</i>`
        newsDiv.querySelector('.news-item-expand-button')?.addEventListener('click', () => {
          newsDiv.classList.toggle('news-item-short')
        })

        newsContainer.appendChild(newsDiv);
      })

      document.querySelector('#root').appendChild(newsContainer);
    } else {
      console.error('Error on server side: ', response.status, response.statusText);
    }
  } catch (e) {
    console.error(`Can't parse news with error: `, e);
  }
}

const renderUser = async () => {
  const response = await fetch('../database/user.json', {
    method: 'POST',
  });

  if (response.status === 200) {
    try {
      const user = await response.json();

      const userDiv = document.createElement('div');
      userDiv.innerText = user.login;
      userDiv.classList.add('user-overlay');

      document.querySelector('#root')?.appendChild(userDiv);
    } catch (e) {
      console.error(`Can't parse user with error: `, e);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNews();
  renderUser()
});