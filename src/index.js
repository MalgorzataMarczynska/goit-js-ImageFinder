import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const form = document.querySelector('#search-form');
const input = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');
const searchBtn = document.querySelector('#search-form button');
const moreBtn = document.querySelector('.load-more');
let page = 1;
let limit = 40;
const totalPages = 500 / limit;
const searchParams = new URLSearchParams({
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  page: page,
  per_page: limit,
});
const getApiRecord = name =>
  `https://pixabay.com/api/?key=31935843-a63100f17f055f7a8dc315776&q=${name}&${searchParams}`;

const clearHtml = () => {
  gallery.innerHTML = '';
};
moreBtn.style.display = 'none';
function renderImages({ total, totalHits, hits }) {
  const markup = hits
    .map(({ webformatURL, tags, likes, views, comments, downloads }) => {
      return `<div class='photo-card'>
          <img src='${webformatURL}' alt='${tags}' loading='lazy' />
  <div class='info'>
   <p class='info-item'><b>Likes:</b> ${likes}</p>
   <p class='info-item'><b>Views:</b> ${views}</p>
   <p class='info-item'><b>Comments:</b> ${comments}</p>
   <p class='info-item'><b>Downloads:</b> ${downloads}</p> </div>
        </div>`;
    })
    .join('');
  clearHtml();
  gallery.insertAdjacentHTML('beforeend', markup);
}
function fetchImages(name) {
  const parsedName = name.trim();
  const url = getApiRecord(parsedName);
  return fetch(url).then(response => {
    if (!response.ok) {
      moreBtn.style.display = 'none';
      clearHtml();
      throw new Error('We find nothing that name!');
    }
    return response.json();
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const searchValue = input.value;
  if (page > totalPages) {
    return Notiflix.Notify.info('We have no more image for you!');
  }
  fetchImages(searchValue)
    .then(images => {
      renderImages(images);
      moreBtn.style.display = 'inline';
    })
    .catch(error => console.log(error));
});
moreBtn.addEventListener('click', event => {
  event.preventDefault();
  const searchValue = input.value;
  console.log(searchValue);
  if (page > totalPages) {
    return Notiflix.Notify.info(
      'We are sorry, but you have reached the end of search results.'
    );
  }
  fetchImages(searchValue)
    .then(images => {
      if (page > 1) {
        moreBtn.textContent = 'Load more images';
      }
      page = +1;
      renderImages(images);
      //clearHtml();
    })
    .catch(error => console.log(error));
});

// axios.get('/users').then(res => {
//   console.log(res.data);
// });
// const fetchImages = name => {
//   const parsedName = name.trim();
//   //   const reg = new RegExp('^[a-zA-Z s]*$');
//   //   const test = reg.test(parsedName);
//   //   console.log(test);
//   if (parsedName.length === 0) {
//     clearHtml();
//     return Notiflix.Notify.info('Enter any character!');
//   }
//   //   if (test !== true) {
//   //     clearHtml();
//   //     return Notiflix.Notify.info('You have to use a letters and space only!');
//   //   }
//   const url = getApiRecord(parsedName);
//   return fetch(url)
//     .then(res => {
//       if (!res.ok) {
//         clearHtml();
//         throw new Error('We find nothing that name!');
//       }
//       return res.json();
//     })
//     .then(images => {
//       // if (countries.length > 10)
//       //   return Notiflix.Notify.info(
//       //     'Too many matches found. Please enter a more specific name.'
//       //   );
//       // if (countries.length === 1) return countryCard(countries[0]);
//       page += 1;
//       if (page > 1) {
//         moreBtn.textContent = 'Load more images';
//       }
//       return imageList(images);
//     })
//     .catch(error => {
//       console.error(error);
//       Notiflix.Notify.failure(error.message, 'error');
//     });
// };
//fetchImages('yellow blossom');
// input.addEventListener('input', event => {
//   fetchImages(event.target.value);
// });
