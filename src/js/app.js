/**
 * Pebble application with information about EMT Malaga buses
 */

var UI = require('ui');
var ajax = require('ajax');

//var codParada = 2304;

//var main = new UI.Card({
//  title: 'MalagaBus',
//  icon: 'images/menu_icon.png',
//  subtitle: 'Parada ' + codParada,
//  body: 'Press any button.',
//  subtitleColor: 'indigo', // Named colors
//  bodyColor: '#9a0036', // Hex colors
//  scrollable: true
//});

var scrInfoParada = new UI.Menu({
  backgroundColor: 'black',
  textColor: 'white',
  highlightBackgroundColor: 'white',
  highlightTextColor: 'black'
});

var scrPrincipal = new UI.Menu({
  backgroundColor: 'black',
  textColor: 'white',
  highlightBackgroundColor: 'white',
  highlightTextColor: 'black',
  sections: [{
    title: 'Menú de paradas',
    items: [{
      title: 'Favoritas'
    }, {
      title: 'Cercanas'
    }, {
      title: 'Listado'
    }]
  }]
});

scrPrincipal.show();

scrPrincipal.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  console.log('The item is titled "' + e.item.title + '"');
  switch (e.itemIndex) {
    case 0: // Paradas favoritas
      console.log("¡No implementado!");
      break;
    case 1: // Paradas cercanas
      console.log("¡No implementado!");
      break;
    case 2: // Listado de paradas
      scrListadoLineas.show();
      queryListadoLineas();
      break;
  }
});

var scrListadoLineas = new UI.Menu({
  backgroundColor: 'black',
  textColor: 'white',
  highlightBackgroundColor: 'white',
  highlightTextColor: 'black'
});



var itemsInfoParada = function(datos, parada) {
  //var lineas = datos.match(/codLinea=(\d+)\.0/g);
  //var direcciones = datos.match(/<span class="direccion">(\s*\w+)+\s*<\/span>/g);

  var lineas = datos.query.results.li;
  //console.log(direcciones);

  var items = [];
  for (var i = 0; i<lineas.length; i++) {
    var numLinea = lineas[i].span[0].strong.a.content.trim();
    var dir = lineas[i].span[1].content.trim();
    var tiempo = '';
    if (lineas[i].span.length > 2) {
      tiempo = lineas[i].span[2].content.trim();
    }
    items.push({
      title: numLinea + " - " + dir,
      subtitle: tiempo
    });
    console.log(numLinea + " - " + dir + " - " + tiempo);
  }

  return {
    title: 'Parada ' + parada,
    items: items
  };
};

var queryInfoParada = function (codigoParada) {
  var yqlUrl = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.emtmalaga.es%2Femt-mobile%2FinformacionParada.html%3FcodParada%3D" + codigoParada + "%22%20and%20xpath%3D'%2F%2Fdiv%5B%40class%3D%22informacion-parada%22%5D%2Ful%2Fli'&format=json&diagnostics=true&callback=";

  ajax(
      {
        url: yqlUrl,
        type: 'json'
      },
      function (data, status, request) {
              var lista = itemsInfoParada(data, codigoParada);
              scrInfoParada.section(1, lista);
              scrInfoParada.show();
            },
      function (error, status, request) {
              console.log('The ajax request failed: ' + error);
              }
  );
};

var itemsListadoLineas = function(datos) {
  var res = datos.query.results.li;
  var items = [];
  for (var i in res) {
    console.log(res[i].h3.a.content + " - " + res[i].p);
    items.push(res[i].h3.a.content + " - " + res[i].p);
  }

  return {
    title: 'Todas las lineas',
    items: items
  }
};

var queryListadoLineas = function() {
  var yqlUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.emtmalaga.es%2Femt-mobile%2Flineas.html%22%20and%20xpath%3D'%2F%2Ful%5B%40data-theme%3D%22f%22%5D%2Fli'&format=json&callback=";

  ajax(
      {
        url: yqlUrl,
        type: 'json'
      },
      function (data, status, request) {
        var lista = itemsListadoLineas(data);
        scrListadoLineas.section(1, lista);
      },
      function (error, status, request) {
        console.log('The ajax request failed: ' + error);
      }
  );
};