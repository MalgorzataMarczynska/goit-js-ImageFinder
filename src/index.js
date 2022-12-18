import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const throttle = require('lodash.throttle');

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-form input');
const gallery = document.querySelector('.gallery');
const moreBtn = document.querySelector('.load-more');
const changeBtn = document.querySelector('.change');
let page = 1;
let limit = 40;
const totalPages = Math.ceil(500 / limit);

const clearHtml = () => {
  gallery.innerHTML = '';
};
moreBtn.style.display = 'none';

function renderImages({ total, totalHits, hits }) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class='photo-card'><a class='gallery-item' href='${largeImageURL}'>
          <img src='${webformatURL}' alt='${tags}' title='${tags}' loading='lazy' /></a>
  <div class='info'>
   <p class='info-item'><b>Likes:</b> ${likes}</p>
   <p class='info-item'><b>Views:</b> ${views}</p>
   <p class='info-item'><b>Comments:</b> ${comments}</p>
   <p class='info-item'><b>Downloads:</b> ${downloads}</p> </div>
        </div>`;
      }
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markup);
  //gallery.insertAdjacentHTML('afterbegin', markup);
}

async function fetchImages(name) {
  const searchParams = new URLSearchParams({
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: limit,
  });
  const getApiRecord = name =>
    `https://pixabay.com/api/?key=31935843-a63100f17f055f7a8dc315776&q=${name}&${searchParams}`;
  const parsedName = name.trim();
  if (parsedName.length === 0) {
    clearHtml();
    return Notiflix.Notify.info('Enter any character!');
  }
  const url = getApiRecord(parsedName);

  try {
    const response = await axios(url);
    const images = await response.data;
    return images;
  } catch (error) {
    if (error.response) {
      //moreBtn.style.display = 'none';
      clearHtml();
      throw new Error('We find nothing that name!');
    }
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const searchValue = input.value;
  page = 1;
  clearHtml();
  fetchImages(searchValue)
    .then(images => {
      if (images.total === 0) {
        clearHtml();
        moreBtn.style.display = 'none';
        return Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      renderImages(images);
      moreBtn.style.display = 'inline';
      return Notiflix.Notify.info(
        `Hooray! We found ${images.totalHits} images.`
      );
    })
    .then(data => {
      const lightboxGallery = new SimpleLightbox('.gallery a');
      lightboxGallery.on('show.simplelightbox', function (event) {
        event.preventDefault();
        const selectedImage = event.target;
        if (selectedImage.nodeName !== 'IMG') {
          return;
        }
        lightboxGallery.refresh();
      });
    })
    .catch(error => console.log(error));
});
//Load more button
moreBtn.addEventListener('click', event => {
  //window.removeEventListener('scroll', handleInfiniteScroll);
  event.preventDefault();
  const searchValue = input.value;
  clearHtml();
  page += 1;
  if (page > totalPages) {
    moreBtn.style.display = 'none';
    return Notiflix.Notify.failure(
      'We are sorry, but you have reached the end of search results.'
    );
  }
  fetchImages(searchValue)
    .then(images => {
      renderImages(images);
    })
    .then(data => {
      const lightboxGallery = new SimpleLightbox('.gallery a');
      lightboxGallery.on('show.simplelightbox', function (event) {
        event.preventDefault();
        const selectedImage = event.target;
        if (selectedImage.nodeName !== 'IMG') {
          return;
        }
        lightboxGallery.refresh();
      });
    })
    .catch(error => console.log(error));
});

//smooth scrolling option
// document.addEventListener('scroll', () => {
//   window.scrollBy({
//     top: 2775,
//     behavior: 'smooth',
//   });
// });

function handleInfiniteScroll() {
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight
  ) {
    const searchValue = input.value;
    page += 1;
    if (page > totalPages) {
      removeInfiniteScroll();
      return Notiflix.Notify.failure(
        'We are sorry, but you have reached the end of search results.'
      );
    }
    fetchImages(searchValue)
      .then(images => {
        renderImages(images);
      })
      .then(data => {
        const lightboxGallery = new SimpleLightbox('.gallery a');
        lightboxGallery.on('show.simplelightbox', function (event) {
          event.preventDefault();
          const selectedImage = event.target;
          if (selectedImage.nodeName !== 'IMG') {
            return;
          }
          lightboxGallery.refresh();
        });
      })
      .catch(error => console.log(error));
  }
}
function removeInfiniteScroll() {
  window.removeEventListener('scroll', throttle(handleInfiniteScroll, 1000));
}

changeBtn.addEventListener('click', () => {
  changeBtn.classList.toggle('is-active');
  const isActive = changeBtn.classList.contains('is-active');
  if (isActive === true) {
    moreBtn.style.display = 'none';
    changeBtn.textContent = 'Switch to load per page';
    window.addEventListener(
      'scroll',
      throttle(handleInfiniteScroll, 1000),
      true
    );
  }
  if (isActive === false) {
    changeBtn.textContent = 'Switch to infinite scroll';
    moreBtn.style.display = 'inline';
    window.removeEventListener(
      'scroll',
      throttle(handleInfiniteScroll, 1000),
      true
    );
  }
});
