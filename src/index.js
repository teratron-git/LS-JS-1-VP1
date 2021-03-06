ymaps.ready(init);

let myBalloon = document.querySelector('#window_balloon'),
    closeButton = document.querySelector('#button__close'),
    addButton = document.querySelector('#button__add'),
    address = document.querySelector('#address'),
    inputName = document.querySelector('#input__name'),
    inputPlace = document.querySelector('#input__place'),
    comments = document.querySelector('#comments'),
    inputText = document.querySelector('#input__text'),
    map = document.querySelector('#map'),
    placemarks = [],
    allCarousel = document.querySelector('.ymaps-2-1-75-balloon__close'),
    coords,
    newPlacemark,
    addressLink;

function init() {
    let myPlacemark,
        myMap = new ymaps.Map('map', {
            center: [54.51, 36.26],
            zoom: 12
        });

    // Создание кластера.
    let clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedNightClusterIcons',
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 156,
        clusterBalloonPagerSize: 10,
        clusterBalloonPagerType: 'marker',
    });

    clusterer.add(placemarks);
    myMap.geoObjects.add(clusterer);

    if (sessionStorage.data) {
        dataObj = JSON.parse(sessionStorage.data);

        for (let i = 0; i < dataObj.length; i++) {
            let newPlacemark = new ymaps.Placemark(dataObj[i].coords, {
                balloonContentHeader: dataObj[i].place,
                balloonContentBody: `<a onclick='openBalloonFull()' class='balloon__address_link'>${dataObj[i].address}</a><br><br>${dataObj[i].comments}<br><br>`,
                balloonContentFooter: `<span class='ligth'>${dataObj[i].currentTime}</span>`
            }, {
                //preset: 'islands#nightDotIcon',
                draggable: false,
                openBalloonOnClick: false // Используем custom balloon.
            });
            newPlacemark.commentContent = `
            <div class='inMyB'>
                <span><b>${dataObj[i].name}</b></span>
                <span class='ligth'>${dataObj[i].place}</span>
                <span class='ligth'>${dataObj[i].currentTime}</span><br>
                <span >${dataObj[i].comments}</span>
            </div><br>`;
            newPlacemark.place = dataObj[i].address;

            myMap.geoObjects.add(newPlacemark);
            clusterer.add(newPlacemark);
            placemarks.push(newPlacemark);
        }

        myMap.geoObjects.events.add('click', e => {
            comments.innerHTML = '';
            comments.innerHTML = e.get('target').commentContent;
            address.innerText = e.get('target').place;
            coords = e.get('target').geometry._coordinates;
            openBalloon();

            if (e.get('target').options._name == 'cluster') {
                if (myBalloon.style.display == 'block') {
                    myBalloon.style.display = 'none';
                }
            } else {
                let allCarousel = document.querySelector('.ymaps-2-1-75-balloon__close');
                if (allCarousel != null) {
                    allCarousel.click();
                }
            }
        });
    } else {
        myMap.geoObjects.events.add('click', e => {
            if (e.get('target').options._name == 'cluster') {
                if (myBalloon.style.display == 'block') {
                    myBalloon.style.display = 'none';
                }
            }
        });
    }

    // Слушаем клик на карте.
    myMap.events.add('click', e => {
        coords = e.get('coords');

        comments.innerHTML = 'Отзывов пока нет...';
        openBalloon();
        if (document.querySelector('.ymaps-2-1-75-balloon') != null) {
            myBalloon.style.display = 'none';
        }

        myPlacemark = new ymaps.Placemark(coords);
        getAddress(coords);
    });

    // Определяем адрес по координатам (обратное геокодирование).
    function getAddress(coords) {
        ymaps.geocode(coords).then(function (res) {
            let firstGeoObject = res.geoObjects.get(0);

            myPlacemark.properties.set({
                // Формируем строку с данными об объекте.
                iconCaption: [
                    // Название населенного пункта или вышестоящее административно-территориальное образование.
                    firstGeoObject.getLocalities().length ?
                    firstGeoObject.getLocalities() :
                    firstGeoObject.getAdministrativeAreas(),
                    // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                    firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                ],
                // В качестве контента балуна задаем строку с адресом объекта.
                balloonContent: firstGeoObject.getAddressLine()
            });
            // Записываем адресс обьекта в хедер окна.
            address.innerText = firstGeoObject.getAddressLine();
            return address.innerText;
        });
    }

    addButton.addEventListener('click', () => {
        if (inputName.value && inputPlace.value && inputText.value) {
            // Получаем адрес отзыва.
            addressLink = address.innerText;

            // Формируем дату.
            let date = new Date(),
                year = date.getFullYear(),
                month = ((date.getMonth() + 1) < 10) ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
                day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate(),
                hours = (date.getHours() < 10) ? `0${date.getHours()}` : date.getHours(),
                minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : date.getMinutes(),
                seconds = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : date.getSeconds(),
                currentTime = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;

            // Создаём метку.
            newPlacemark = new ymaps.Placemark(
                coords, {
                    balloonContentHeader: inputPlace.value,
                    balloonContentBody: `<a onclick='openBalloonFull()' class='balloon__address_link'>${addressLink}</a><br><br>${inputText.value}<br><br>`,
                    balloonContentFooter: `<span class='ligth'>${currentTime}</span>`
                }, {
                    draggable: false,
                    openBalloonOnClick: false // Используем custom balloon.
                }
            );

            // Добавляем метку на карту, в кластер и массив placemarks.
            myMap.geoObjects.add(newPlacemark);
            clusterer.add(newPlacemark);
            placemarks.push(newPlacemark);

            // Обновляем содержимое нашего балуна
            if (comments.innerHTML === 'Отзывов пока нет...') comments.innerHTML = '';
            newPlacemark.commentContent =
                `<div class='inMyB'>
                    <span><b>${inputName.value}</b></span>
                    <span class='ligth'>${inputPlace.value}</span>
                    <span class='ligth'>${currentTime}</span><br>
                    <span>${inputText.value}</span>
                </div><br>`;
            comments.innerHTML += newPlacemark.commentContent;
            newPlacemark.place = address.innerText;
            
            //Записываем данные
            let sData = sessionStorage.data ? JSON.parse(sessionStorage.data) : [];
            let obj = {
                name: inputName.value,
                place: inputPlace.value,
                comments: inputText.value,
                address: newPlacemark.place || '',
                coords: coords || '',
                currentTime: currentTime
            };
            sData.push(obj);
            sessionStorage.data = JSON.stringify(sData);
            clearInputs();

            newPlacemark.events.add('click', () => {
                openBalloon();
                comments.innerHTML = newPlacemark.commentContent;
                address.innerText = newPlacemark.place;
            });
        } else {
            alert('Необходимо заполнить все поля!');
        }
    });
}

closeButton.addEventListener('click', () => {
    myBalloon.style.display = 'none';
    clearInputs();
});

function clearInputs() {
    inputName.value = '';
    inputPlace.value = '';
    inputText.value = '';
}

// Наш кастомный балун.
function openBalloon() {
    myBalloon.style.top = event.clientY + 'px';
    myBalloon.style.left = event.clientX + 'px';
    myBalloon.style.display = 'block';

    let wH = map.clientHeight,
        wW = map.clientWidth,
        hD = myBalloon.clientHeight + Number.parseInt(myBalloon.style.top),
        wD = myBalloon.clientWidth + Number.parseInt(myBalloon.style.left),
        deltaH = wH - hD - 10,
        deltaW = wW - wD - 10;

    if (deltaH < 0) myBalloon.style.top = Number.parseInt(myBalloon.style.top) + deltaH + 'px';
    if (deltaW < 0) myBalloon.style.left = Number.parseInt(myBalloon.style.left) + deltaW + 'px';

    let allCarousel = document.querySelector('.ymaps-2-1-75-balloon__close');
    if (allCarousel != null) {
        allCarousel.click();
    }
}

// Балун с контентом из placemarks.
function openBalloonFull() {
    address.innerText = '';
    comments.innerHTML = '';
    addressLink = document.querySelector('.balloon__address_link');

    for (let i = 0; i < placemarks.length; i++) {
        if (addressLink.innerText === placemarks[i].place) {
            address.innerText = placemarks[i].place;
            comments.innerHTML += placemarks[i].commentContent;
        }
    }
    openBalloon();
}