// historico
var _history = [];
// opçao selecionada do menu home
var _homeSelected = 1;
// valor de translação dos items do menu home
var _homeTranslation = 0;
// tamanho da scrollbar do menu home
var _homeBarSize;
// posicao default da scrollbar
var _homeBarOffset;

// guarda numero de elementos do menu em que nos encontramos
var _el;

var _friendSelected = 0;

// FIXME PROVISORIO
var _day = 'Hoje';
var _sort = 'por hora'


function init(data) {
  updateClock();
  loadData(data);
  setHomeScrollbar();
  setNumPad();
}

function loadData(data){
  localStorage.setItem('ArtistData', JSON.stringify(data.artists));
  localStorage.setItem('FoodData', JSON.stringify(data.food));
  localStorage.setItem('FriendsData', JSON.stringify(data.friends));
}

function setHomeScrollbar() {
  var scrollbar = document.getElementById('home-scrollbar');

  var n = document.getElementById('home').childElementCount - 1;
  var r = 95;
  var p = 2 * Math.PI * r;
  _homeBarSize = p / 4 / n;
  _homeBarOffset = -3/8*p - _homeBarSize*(n-1);

  scrollbar.style.setProperty('--p', p);
  scrollbar.style.setProperty('--r', r);
  scrollbar.children[1].style.strokeDasharray = _homeBarSize + ' ' + p;
  scrollbar.children[1].style.strokeDashoffset = _homeBarOffset + _homeSelected*_homeBarSize;
}

function updateClock() {
  var lock = document.getElementById('lock').children[1];
  var time = document.getElementById('time').children[1];
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();

  if (hours < 10)
    hours = '0' + hours;
  if (minutes < 10)
    minutes = '0' + minutes;

  if(_history[0] != 'home') {
    lock.innerHTML = '<div>' + Math.floor(hours/10) + '</div>' +
                     '<div>' + hours%10 + '</div>' +
                     '<div>' + Math.floor(minutes/10) + '</div>' +
                     '<div>' + minutes%10 + '</div>' +
                     // + '<div>' + day + Month[:3] + '</div>';
                     '<div>' + '19 Abr' + '</div>';
  }

  time.innerHTML = hours + ':' + minutes;
  setTimeout(updateClock, 1000);
}

function toHome() {
  var lock = document.getElementById('lock');
  var home = document.getElementById('home');
  var time = document.getElementById('time');

  lock.style.display = 'none';
  time.style.display = 'block';
  home.style.display = 'block';

  home.scrollTop = 1;
  _history.push('home');

  lock.children[2].style.opacity = '0.5';
}

function unlock() {
  document.getElementById('lock').children[2].style.opacity = '0.8';
  setTimeout(toHome, 200);
}

function lock() {
  var lock = document.getElementById('lock');
  var time = document.getElementById('time');

  lock.style.display = 'block';
  time.style.display = 'none';

  for (let i=0; i<_history.length; i++)
    document.getElementById(_history[i]).style.display = 'none';

  _history = [];
}

function goHome() {
  newScreen(_history[0]);
}

function goBack() {
  i = _history.length - 2;
  if (i>=0) newScreen(_history[i]);
}

function newScreen(next) {
  var pos = _history.lastIndexOf(next);
  var dim = _history.length;
  var prev = _history[dim-1];

  if (pos == -1)
    _history.push(next);
  else
    for (let i=dim-1; i!= pos; i--)
      _history.pop();

  document.getElementById(prev).style.display = 'none';
  document.getElementById(next).style.display = 'block';
}

function newScreenWithSort(next) {
  var sortDiv = document.getElementById(next).getElementsByClassName('sort')[0].children[1].children[1];
  switch(next) {
    case 'atuacoes':
      swipeCenter();
      sortArtists(sortDiv.innerHTML);
      break;
    case 'comida':
      sortFood(sortDiv.innerHTML);
      break;
    case 'friends':
      sortFriends();
      break;
  }
  newScreen(next);
}

function slide() {
  var home = document.getElementById('home');
  var selected = document.getElementById('selected');
  var newSelected = home.children[_homeSelected];
  var scrollbar = document.getElementById('home-scrollbar').children[1];

  home.style.setProperty('--translation', _homeTranslation);
  selected.removeAttribute('id');
  newSelected.id = 'selected';
  scrollbar.style.strokeDashoffset = _homeBarOffset + _homeSelected*_homeBarSize;
}

function slideDown() {
  _homeTranslation += 145/3;
  _homeSelected--;
  slide();
}

function slideUp() {
  _homeTranslation -= 145/3;
  _homeSelected++;
  slide();
}

function clickHome(clicked, next) {
  if (clicked == _homeSelected-1)
    slideDown();
  else if (clicked == _homeSelected+1)
    slideUp();
  else if (next == 'atuacoes' || next == 'comida' || next == 'friends')
    newScreenWithSort(next);
  // else if( clicked == _homeSelected )
  //   newScreen(next);
}

function resetOverflowY() {
  home.style.overflowY = 'scroll'
}

function scrollHome() {
  var home = document.getElementById('home');
  var scrolled = 0;

  if (home.scrollTop < 0.7 && _homeSelected > 0) {
    slideDown();
    scrolled = 1;
  }
  else if (home.scrollTop > 0.9 && _homeSelected < home.childElementCount-2) {
    slideUp();
    scrolled = 1;
  }

  home.scrollTop = 1;
  if (scrolled) {
    home.style.overflowY = 'hidden';
    setTimeout(resetOverflowY, 200);
  }
}

function openChangeSort() {
  var sort = document.getElementById('change-sort').getElementsByTagName('h1');
  var sort1 = sort[0];
  var sort2 = sort[1];
  var sort3 = sort[2];

  switch(_history[_history.length-1]) {
    case 'atuacoes':
      sort1.innerHTML = 'por hora';
      sort2.innerHTML = 'por palco';
      sort3.innerHTML = 'por nome';
      break;
    case 'comida':
      sort1.innerHTML = 'por nome';
      sort2.innerHTML = 'por tempo';
      sort3.innerHTML = 'proximidade';
      break;
  }

  newScreen('change-sort');
}

function changeSort(el) {
  var sort = el.children[0].innerHTML;
  var prev = _history[_history.length - 2];
  var sortDiv = document.getElementById(prev).getElementsByClassName('sort')[0].children[1].children[1];
  _sort = sort; /* FIXME */

  switch(prev) {
    case 'atuacoes':
      sortArtists(sort);
      break;
    case 'comida':
      sortFood(sort);
      break;
  }

  sortDiv.innerHTML = sort;
  newScreen(_history[_history.length - 2]);
}

// sortear artistas
function sortArtists(sort) {
  document.getElementById('atuacoes').scrollTop = 0;
  var atuacoes = document.getElementById('atuacoes').children[0];
  var artistData = JSON.parse(localStorage.getItem('ArtistData'));

  if (sort == 'por hora') artistData.sort(compareArtistTime);
  else if (sort == 'por palco') artistData.sort(compareArtistStage);
  else if (sort == 'por nome') artistData.sort(compareArtistName);

  atuacoes.innerHTML = '';
  for (let i = 0; i < artistData.length; i++) {
    if (artistData[i].day == _day) /* FIXME */
      atuacoes.innerHTML += '<div onclick="artistDetails(\'' + artistData[i].ref + '\')">' +
                              '<img src="img/' + artistData[i].ref + '_icon.png">' +
                              '<h1>' + artistData[i].name + '</h1>' +
                              '<h2 class="palco' + artistData[i].stage + '">Palco ' + artistData[i].stage + '</h2>' +
                              '<h3>' + artistData[i].time + '</h3>' +
                            '</div>';
  }
}

function sortFood(sort) {
  document.getElementById('comida').scrollTop = 0;
  var comida = document.getElementById('comida').children[0];
  var foodData = JSON.parse(localStorage.getItem('FoodData'));

  if (sort == 'por tempo') foodData.sort(compareFoodTime);
  else if (sort == 'proximidade') foodData.sort(compareFoodDistance); /* FIXME build sort*/
  else if (sort == 'por nome') foodData.sort(compareFoodName);

  comida.innerHTML = '';
  for (let i = 0; i < foodData.length; i++)
    comida.innerHTML += '<div onclick="foodMenu(\'' + foodData[i].ref + '\')">' + /* FIXME onclick*/
                          '<img src="img/' + foodData[i].ref + '.png">' +
                          '<h1>' + foodData[i].name + '</h1>' +
                          '<h2>Aprox. ' + foodData[i].time + ' min</h2>' +
                        '</div>';
}

function sortFriends() {
  document.getElementById('friends').scrollTop = 0;
  var friends = document.getElementById('friends').children[0];
  var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
  var foodData = JSON.parse(localStorage.getItem('FoodData'));

  friendsData.sort(compareFriendsName);

  friends.innerHTML = '';
  for (let i = 0; i < friendsData.length; i++)
    if (friendsData[i].added != '0') {
      friends.innerHTML += '<div onclick="friendAction(this)">' +
                             '<img src="img/' + friendsData[i].ref + '.jpg">' +
                             '<h1>' + friendsData[i].name + '</h1>' +
                             '<h2>' + friendsData[i].surname + '</h2>' +
                             '<div class="slided-icons">' +
                               '<img src="img/trash.png" onclick="removeFriend(\'' + friendsData[i].ref + '\')" />' +
                               '<img src="img/map.png" onclick="navigate(\'' + friendsData[i].coord[0] + '\', \'' + friendsData[i].coord[1] + '\')" />' +
                             '</div>' +
                           '</div>';
    }

  if (friends.innerHTML == '')
    friends.innerHTML = '<h3>Sem amigos de momento... clique em \'Adcionar\' para começar</h3>';
}

// comparar por hora de atuacao
// se for igual, comparar por palco
function compareArtistTime(a, b) {
  var aTime = a.time;
  var bTime = b.time;

  if(aTime[0] == '0') aTime = '3' + aTime.slice(1,5);
  if(bTime[0] == '0') bTime = '3' + bTime.slice(1,5);

  if (aTime > bTime) return 1;
  if (aTime < bTime) return -1;
  // if (aTime == bTime) compareArtistStage(a, b);
  return 0;
}

// comparar por palco
// se for igual, comparar por hora
function compareArtistStage(a, b) {
  if (a.stage > b.stage) return 1;
  if (a.stage < b.stage) return -1;
  // if (a.stage == b.stage) compareArtistTime(a, b);
  return 0;
}

// comparar por nome do artista
function compareArtistName(a, b) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}

function compareFoodTime(a, b) {
  var aTime = a.time;
  var bTime = b.time;

  if(aTime.length == 1) aTime = '0' + aTime;
  if(bTime.length == 1) bTime = '0' + bTime;

  if (aTime > bTime) return 1;
  if (aTime < bTime) return -1;
  // if (aTime == bTime) compareArtistStage(a, b);
  return 0;
}

function compareFoodName(a, b) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}

function compareFoodDistance(a, b) {
  if (a.distance <= b.distance) return 1;
  if (a.distance > b.distance) return -1;
  return 0;
}

function compareFriendsName(a, b) {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  return 0;
}

// abre ecra de descricao do artista
function artistDetails(ref) {
  var artistDiv = document.getElementById('artist');
  var artistData = JSON.parse(localStorage.getItem('ArtistData'));

  var i = 0;
  while (artistData[i].ref != ref) i++;
  artist = artistData[i];

  artistDiv.innerHTML = '<img src="img/' + artist.ref + '.png">' +
                        '<h1>' + artist.name + '</h1>' +
                        '<p>' + artist.about + '</p>' +
                        '<ul>' +
                          '<li>' + artist.musics[0] + '</li>' +
                          '<li>' + artist.musics[1] + '</li>' +
                          '<li>' + artist.musics[2] + '</li>' +
                        '</ul>';

  newScreen('artist');
  artistDiv.scrollTop = 0;
}

function foodMenu(ref) {
  var foodDiv = document.getElementById('menu').children[0];
  var foodData = JSON.parse(localStorage.getItem('FoodData'));

  document.getElementById('menu').children[1].children[1].children[1].children[0].innerHTML = '0.00';
  foodDiv.scrollTop = 0;

  var i = 0;
  while (foodData[i].ref != ref) i++;
  var menu = foodData[i].menu;
  _el=menu.length;

  foodDiv.innerHTML = ''
  for (let i = 0; i < menu.length; i++)
    foodDiv.innerHTML += '<div>' +
                           '<div id="minum-aux"> </div>' +
                           '<div id="plus-aux"> </div>' +
                           '<h6 id="minum">-</h6>' +

                           '<h6 id="plus">+</h6>' +

                           '<h1>' + menu[i].name + '</h1>' +
                           '<h2>' + menu[i].price + ' €</h2><h3></h3>' +
                           '<div onclick="menuRemove(' + menu[i].price + ',' + i + ')"></div>' +
                           '<div onclick="menuAdd(' + menu[i].price + ',' + i + ')"></div>' +
                         '</div>';

  newScreen('menu');
  foodDiv.scrollTop = 0;
}

function menuAdd(price, i) {
  var totalTag = document.getElementById('menu-price').children[1].children[1].children[0];
  var total = parseFloat(totalTag.innerHTML);
  var counterTag = document.getElementById('menu').children[0].children[i].children[6];
  var counter;

  // document.getElementById('menu-price').children[1].children[1].style.opacity = '1';
  document.getElementById('menu-price').children[0].style.borderColor = 'var(--green)';

  total += price;
  totalTag.innerHTML = '' + total.toFixed(2);

  if (counterTag.innerHTML == ''){
    counterTag.innerHTML = 'x1';
    document.getElementById('menu').children[0].children[i].children[0].style.display='block';
    document.getElementById('menu').children[0].children[i].children[2].style.display='block';

  }
  else {
    counter = parseInt(counterTag.innerHTML.slice(1));
    counter += 1;
    counterTag.innerHTML = 'x' + counter;
  }
}

function menuRemove(price, i) {
  var totalTag = document.getElementById('menu-price').children[1].children[1].children[0];
  var total = parseFloat(totalTag.innerHTML);
  var counterTag = document.getElementById('menu').children[0].children[i].children[6];
  var counter;

  if (counterTag.innerHTML != '') {

    total -= price;
    totalTag.innerHTML = '' + total.toFixed(2);

    if (counterTag.innerHTML == 'x1') {

      counterTag.innerHTML = '';
      // document.getElementById('menu-price').children[1].children[1].style.opacity = '0.5';
      if (totalTag.innerHTML == '0.00')
        document.getElementById('menu-price').children[0].style.borderColor = 'var(--darker)';

      document.getElementById('menu').children[0].children[i].children[0].style.display='none';
      document.getElementById('menu').children[0].children[i].children[2].style.display='none';
    }
    else {
      counter = parseInt(counterTag.innerHTML.slice(1));
      counter -= 1;
      counterTag.innerHTML = 'x' + counter;
    }
  }
}



// FIXME PROVISORIO
// mudar o dia das atuacoes
// meter automatico
// 1 line no sortArtists
function swipe(selected) {
  if (selected == 'left') {
    if(_day == 'Hoje') swipeRight();
    if(_day == '20') swipeCenter();
  }
  else if (selected == 'right') {
    if(_day == 'Hoje') swipeLeft();
    if(_day == '18') swipeCenter();
  }
  sortArtists(_sort);
}

function swipeRight() {
  var sort = document.getElementById('sort-aux').children;
  _day = '18';

  sort[2].innerHTML = '';
  sort[1].innerHTML = _day;
  sort[3].innerHTML = 'Hoje';
}

function swipeCenter() {
  var sort = document.getElementById('sort-aux').children;
  _day = 'Hoje';

  sort[2].innerHTML = '18';
  sort[1].innerHTML = _day;
  sort[3].innerHTML = '20';
}

function swipeLeft() {
  var sort = document.getElementById('sort-aux').children;
  _day = '20';

  sort[2].innerHTML = 'Hoje';
  sort[1].innerHTML = _day;
  sort[3].innerHTML = '';
}

// FOR BUILDING
function overflow(button) {
  var item = document.getElementById('watch').style;
  if (item.overflow == 'visible') {
    item.overflow = 'hidden';
    button.innerHTML = 'SHOW';
  }
  else {
    item.overflow = 'visible';
    button.innerHTML = 'HIDE';
  }
}

function lista(total){
    var foodData = JSON.parse(localStorage.getItem('FoodData'));
    var total1 = document.getElementById('menu-price').children[1].children[1].children[0];
    var lista = document.getElementById('lista');
    var element;
    var qnt;
    var price;

    lista.children[5].innerHTML = '';
    for(let i=0;i<_el;i++) {
      element = document.getElementById('menu').children[0].children[i]
      if(element.children[6].innerHTML!=''){
        qnt = parseInt(element.children[6].innerHTML.slice(1));
        price = parseFloat(element.children[5].innerHTML.slice(0,-2))*qnt;
        lista.children[5].innerHTML+='<li>' +
                         element.children[6].innerHTML.slice(1) + 'x ' +
                         element.children[4].innerHTML + ' ' +
                         '<span>' +
                         price.toFixed(2) +
                         ' €</span>'
                         '</li>';
       }
    }
    lista.children[6].innerHTML ='Total: ' + total1.innerHTML + ' €';
    newScreen('lista');
}

function autenticate() {
  document.getElementById('autentication').children[1].style.opacity = '1';
  setTimeout(autenticateAccept, 200);
}

function autenticateAccept() {
  newScreen('senha');
  document.getElementById('autentication').children[1].style.opacity = '0.5';
}

function choosePayment(total) {
    newScreen('choose-payment');
}

function senha() {
  document.getElementById('lock').children[0].innerHTML = 'SENHA 68';

  goHome();
  setTimeout(removeSenha, 5000);
}

function removeSenha() {
  document.getElementById('lock').children[0].innerHTML = '';
}

function limpar() {
  goBack();
  goBack();
  foodMenu('burguerking');
  document.getElementById('menu-price').children[0].style.borderColor = 'var(--darker)';
}




function friendAction(friend) {
  if (friend.id != 'clicked') friendExpand(friend);
  else friendContract(friend);
}

function friendExpand(friend) {
  if (_friendSelected == 1)
    document.getElementById('clicked').removeAttribute('id');
  else
    _friendSelected = 1;

  friend.id = 'clicked';
}

function friendContract(friend) {
  friend.removeAttribute('id');
  _friendSelected = 0;
}

function removeFriend(ref) {
  var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
  for (let i=0; i<friendsData.length; i++)
    if (friendsData[i].ref == ref){
      friendsData[i].added = "0";
      localStorage.setItem('FriendsData', JSON.stringify(friendsData));
      break;
    }
  setTimeout(reSort, 1);
}

function reSort() {
  sortFriends();
}

function navigate(x, y) {
  var pin = document.getElementById('map').children[1];
  pin.style.left = x + 'px';
  pin.style.top = y + 'px';
  newScreen('map');
}

function NFC(){
  newScreen('NFC');
  setTimeout(change1,3000);
}

function change1(){
  newScreen('NFC-aux1');
  setTimeout(autfriend,1500);
}

function change2(){
  verifyfriend();
}

function autfriend(){
    var aut = document.getElementById("NFC-aut");
    var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
    for(let i=0;i<friendsData.length;i++){
        if(friendsData[i].added=="0"){
            aut.innerHTML='<h1>' + friendsData[i].name + '</h1>'
                          + '<img src="img/' + friendsData[i].ref + '.jpg">' + '<p>Adicionar ' + friendsData[i].name + ' como amigo?</p>' + '<h2 id="confirmar-nfc" onclick="verifyfriend()">Confirmar</h2>' +
                        '<div onclick="newScreen(\'' + 'home' + '\')"></div>' +
                        '<h2 id="cancelar-nfc" onclick="newScreen(\'' + 'home' + '\')">Cancelar</h2>' +
                        '<div onclick="verifyfriend()"></div>';
            break;
        }
    }
    newScreen('NFC-aut');
}

function verifyfriend(){
  var newFriend = document.getElementById("NFC-aux2");
  var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
  for(let i=0;i<friendsData.length;i++){
    if(friendsData[i].added=="0"){
      newFriend.innerHTML= '';
      friendsData[i].added="1";
      newFriend.innerHTML+='<img src="img/' + friendsData[i].ref + '.jpg">' +
      '<h1> Tu e ' + friendsData[i].name + ' são agora amigos </h1>' +
      '<h2> Clica para continuar </h2>';
      localStorage.setItem('FriendsData', JSON.stringify(friendsData));
      break;
    }
  }
  newScreen('NFC-aux2');
}


function addNumber(n) {
  if(document.getElementById('tlm').children[0].innerHTML.length <  9 )
    document.getElementById('tlm').children[0].innerHTML += n;
      document.getElementById('tlm').children[13].children[1].src = "img/add_user_disabled.png";
  if(document.getElementById('tlm').children[0].innerHTML.length > 0)
    document.getElementById('tlm').children[13].children[0].src = "img/delete_number.png";
  if(document.getElementById('tlm').children[0].innerHTML.length == 9)
    document.getElementById('tlm').children[13].children[1].src = "img/add_user.png";
}

function deleteNumber() {
  var number = document.getElementById('tlm').children[0].innerHTML;
  document.getElementById('tlm').children[0].innerHTML = number.slice(0, -1);
  if(document.getElementById('tlm').children[0].innerHTML.length == 0)
    document.getElementById('tlm').children[13].children[0].src = "img/delete_number_disabled.png";
  if(document.getElementById('tlm').children[0].innerHTML.length <  9 )
    document.getElementById('tlm').children[13].children[1].src = "img/add_user_disabled.png";
}

function autfriendtlm(){
    var aut = document.getElementById("NFC-aut");
    var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
    var tlm = document.getElementById('tlm').children[0].innerHTML;

    if(document.getElementById('tlm').children[0].innerHTML.length == 9 ) {
      for(let i=0;i<friendsData.length;i++){
          if(friendsData[i].tlm == tlm){
              aut.innerHTML='<h1>' + friendsData[i].name + '</h1>'
                            + '<img src="img/' + friendsData[i].ref + '.jpg">' + '<p>Adicionar ' + friendsData[i].name + ' como amigo?</p>' + '<h2 id="confirmar-nfc" onclick="verifyfriendtlm()">Confirmar</h2>' +
                          '<div onclick="newScreen(\'' + 'home' + '\')"></div>' +
                          '<h2 id="cancelar-nfc" onclick="newScreen(\'' + 'home' + '\')">Cancelar</h2>' +
                          '<div onclick="verifyfriendtlm()"></div>';
          }
      }
      newScreen('NFC-aut');
    }
}

function verifyfriendtlm(){
  var newFriend = document.getElementById("NFC-aux2");
  var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
  var tlm = document.getElementById('tlm').children[0].innerHTML;

  for(let i=0;i<friendsData.length;i++){
    if(friendsData[i].tlm == tlm){
      newFriend.innerHTML = '';
      friendsData[i].added="1";
      newFriend.innerHTML+='<img src="img/' + friendsData[i].ref + '.jpg">' +
      '<h1> Tu e ' + friendsData[i].name + ' são agora amigos </h1>' +
      '<h2> Clica para continuar </h2>';
      localStorage.setItem('FriendsData', JSON.stringify(friendsData));
      break;
    }
  }
  newScreen('NFC-aux2');
}
//
// function acceptNumber() {
//   var friendsData = JSON.parse(localStorage.getItem('FriendsData'));
//   var tlm = document.getElementById('tlm').children[0].innerHTML;
//
//   for(let i=0; i<friendsData.length; i++)
//     if(friendsData[i].tlm == tlm){
//       friendsData[i].added = "1";
//       localStorage.setItem('FriendsData', JSON.stringify(friendsData));
//       newScreenWithSort('friends');
//     }
// }

function setNumPad() {
  var numpad = document.getElementById('numpad');
  var click = document.getElementById('numpad-click');

  var n = 10;
  var r = 100;
  var p = 2 * Math.PI * r;
  numSize = p * 5 / 8 / n;
  numDash = p - numSize;

  numpad.style.setProperty('--p', p);
  numpad.style.setProperty('--r', r);

  for (let i=0; i < 10; i++) {
    numpad.innerHTML += '<circle/>';

    number = 9 - i;
    click.innerHTML += '<rect x="70" y="-15" width="30" height="30" onclick="addNumber(' + number + ')"/>';

    numpad.children[i].style.strokeDasharray = numSize + ' ' + numDash;
    rotate = 360 * ( 7 + 5*i/n + i/(n-1) ) / 8;
    numpad.children[i].style.transform = "rotate(" + rotate + "deg)";
    numpad.children[i].style.webkitTransform = "rotate(" + rotate + "deg)";

    rotateSquare = 360 * ( 7 + 5*i/n + i/(n-1) ) / 8 + 11;
    click.children[i].style.transform = "rotate(" + rotateSquare + "deg)";
    click.children[i].style.webkitTransform = "rotate(" + rotateSquare + "deg)";
  }
}

function openNumPad() {
  document.getElementById('tlm').children[0].innerHTML = '';
  newScreen('tlm');
}
