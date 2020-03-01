ymaps.ready(init);


let myBalloon = document.querySelector("#window_balloon"),
    closeButton = document.querySelector("#button__close"),
    addButton = document.querySelector("#button__add"),
    address = document.querySelector("#address"),
    inputName = document.querySelector("#input__name"),
    inputPlace = document.querySelector("#input__place"),
    comments = document.querySelector("#comments"),
    inputText = document.querySelector("#input__text"),
    placemarks = [];

function init() {
    let myPlacemark,
        myMap = new ymaps.Map("map", {
            center: [54.51, 36.26],
            zoom: 12
        });


    if (sessionStorage.data) {
        console.log('+');
        dataObj = JSON.parse(sessionStorage.data);
        console.log(dataObj);
        for (let i = 0; i < dataObj.length; i++) {
            let myPoint = createPlacemark(dataObj[i].coords);
            myMap.geoObjects.add(myPoint);
        }

    }

    // Создание кластера.
    let clusterer = new ymaps.Clusterer({
        preset: "islands#invertedNightClusterIcons",
        groupByCoordinates: false,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: "cluster#balloonCarousel",
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 250,
        clusterBalloonPagerSize: 10,
        clusterBalloonPagerType: "marker",
    });

    clusterer.add(placemarks);
    myMap.geoObjects.add(clusterer);

    // Слушаем клик на карте.
    myMap.events.add("click", e => {
        coords = e.get("coords");
        comments.innerHTML = "Отзывов пока нет...";

        // Выводим окно с отзывами и формой.
        openBalloon();
        myPlacemark = createPlacemark(coords);
        getAddress(coords);
    });

    // Создание метки.
    function createPlacemark(coords) {
        return new ymaps.Placemark(coords);
    }

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
                //balloonContent: firstGeoObject.getAddressLine()
            });
            // Записываем адресс обьекта в хедер окна.
            address.innerText = firstGeoObject.getAddressLine();
        });
    }

    addButton.addEventListener("click", () => {
        if (inputName.value && inputPlace.value && inputText.value) {
            // Получаем адрес отзыва.
            let addressLink = address.innerText;

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
            let newPlacemark = new ymaps.Placemark(
                coords, {
                    balloonContentHeader: inputPlace.value,
                    balloonContentBody: `<a onclick="openBalloonFull()" class="balloon__address_link">${addressLink}</a><br><br>${inputText.value}<br><br>`,
                    balloonContentFooter: currentTime
                }, {
                    preset: "islands#nightDotIcon",
                    draggable: false,
                    openBalloonOnClick: false // Используем custom balloon.
                }
            );

            // Добавляем метку на карту, в кластер и массив placemarks.
            myMap.geoObjects.add(newPlacemark);
            clusterer.add(newPlacemark);
            placemarks.push(newPlacemark);

            // Обновляем содержимое нашего балуна
            if (comments.innerHTML === "Отзывов пока нет...") comments.innerHTML = "";
            newPlacemark.commentContent =
                `<div><span><b>${inputName.value}</b></span>
                 <span class="ligth">${inputPlace.value}</span>
                <span class="ligth">${currentTime}:</span><br>
                 <span>${inputText.value}</span></div><br>`;
            comments.innerHTML += newPlacemark.commentContent;
            newPlacemark.place = address.innerText;

            // debugger;
            var sData = sessionStorage.data ? JSON.parse(sessionStorage.data) : [];
            // var sData = [{
            //     comments: newPlacemark.commentContent,
            //     address: newPlacemark.place || '',
            //     coords: coords || ''
            // }];
            debugger;
            let obj;

            debugger;
            obj = {
                comments: newPlacemark.commentContent,
                address: newPlacemark.place || '',
                coords: coords || ''
            };
            sData.push(obj);
            sessionStorage.data = JSON.stringify(sData);

            // Очищаем инпуты.
            clearInputs();

            newPlacemark.events.add("click", () => {
                openBalloon();
                comments.innerHTML = newPlacemark.commentContent;
                address.innerText = newPlacemark.place;
            });
        } else {
            alert("Необходимо заполнить все поля!");
        }
    });
}

closeButton.addEventListener("click", () => {
    myBalloon.style.display = "none";
    clearInputs();
});

function clearInputs() {
    inputName.value = "";
    inputPlace.value = "";
    inputText.value = "";
}

// Наш кастомный балун.
function openBalloon() {
    myBalloon.style.top = event.clientY + "px";
    myBalloon.style.left = event.clientX + "px";
    myBalloon.style.display = "block";
}

// Балун с контентом из placemarks.
function openBalloonFull() {
    address.innerText = "";
    comments.innerHTML = "";
    let addressLink = document.querySelector(".balloon__address_link");
    let allCarousel = document.querySelector(".ymaps-2-1-75-balloon__close-button");


    for (let i = 0; i < placemarks.length; i++) {
        if (addressLink.innerText === placemarks[i].place) {
            address.innerText = placemarks[i].place;
            comments.innerHTML += placemarks[i].commentContent;
        }
    }
    openBalloon();
    allCarousel.click();
}