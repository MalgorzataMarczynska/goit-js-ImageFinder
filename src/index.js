import './css/styles.css';
import axios from 'axios';
import Notiflix from 'notiflix';
const input = document.querySelector('#search-form input');
const KEY = 31935843 - a63100f17f055f7a8dc315776;
const getApiRecord = name =>
  `https://pixabay.com/api/?key=${KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true`;
const clearHtml = () => {
  countryList.innerHTML = '';
  countryInfo.innerHTML = '';
};
const imageCard = ({ flags, name, capital, population, languages }) => {
  const card = document.createElement('article');
  const parsedLangs = languages.map(lang => lang.name).join(', ');
  card.innerHTML = `
  <h3 class='country-header'>
    <img src="${flags.svg}" alt="${name} flag" width="40px" />
    ${name}
  </h3>
  <div class='country-data'><b>Capital:</b> ${capital}</div>
  <div class='country-data'><b>Population:</b> ${population}</div>
  <div class='country-data'><b>Languages:</b> ${parsedLangs}</div>
  `;
  clearHtml();
  countryInfo.append(card);
};
axios.get('/users').then(res => {
  console.log(res.data);
});
const fetchImages = name => {
  const parsedName = name.trim();
  const reg = new RegExp('^[a-zA-Z s]*$');
  const test = reg.test(parsedName);
  console.log(test);
  if (parsedName.length === 0) {
    clearHtml();
    return Notiflix.Notify.info('Enter any character!');
  }
  if (test !== true) {
    clearHtml();
    return Notiflix.Notify.info('You have to use a letters and space only!');
  }
  const url = getApiRecord(parsedName);
  return fetch(url)
    .then(res => {
      if (!res.ok) {
        clearHtml();
        throw new Error('We find nothing that name!');
      }
      return res.json();
    })
    .then(countries => {
      if (countries.length > 10)
        return Notiflix.Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      if (countries.length === 1) return countryCard(countries[0]);
      return countriesList(countries);
    })
    .catch(error => {
      console.error(error);
      Notiflix.Notify.failure(error.message, 'error');
    });
};

input.addEventListener('input', event => {
  fetchImages(event.target.value);
});
