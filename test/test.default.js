describe('Default settings', function() {
  var list,
  itemHTML,
  guybrush,
  manny;

  beforeEach(function() {
    itemHTML = fixture.list(['name', 'born'])
    list = new List('list', {
      valueNames: ['name', 'born'],
      item: itemHTML,
      plugins: [
      ListStyle({
        callback: function(item) {
          if(item._values.name=="Guybrush Threepwood") {
            return {
              rowClass: "red"
            };
          }
          return {};
        }
      })
      ]
    }, fixture.all);
    guybrush = list.get('name', 'Guybrush Threepwood')[0];
    manny = list.get('name', 'Manny Calavera')[0];
  });

  afterEach(function() {
    fixture.removeList();
  });

  it('guybrush s background should be red', function() {
    expect(guybrush.elm.className).to.be('red');
  });

  it('manny s background should be default', function() {
    expect(manny.elm.className).to.be('');
  });
});

describe('Test Example', function() {
  var list,
  itemHTML,
  guybrush,
  manny,
  murray;

  beforeEach(function() {
    itemHTML = fixture.list(['name', 'born'])
    list = new List('list', {
      valueNames: ['name', 'born'],
      item: itemHTML,
      plugins: [
      ListStyle({
        callback: function(item) {
          var classObject = {};
          if(item && item._values) {
            if(item._values.name.indexOf("u")>=0) {
              classObject.rowClass = "red";
            }
            if(item._values.born < 1765) {
              classObject.born = "blue";
            }
          }
          return classObject;
        }
      })
      ]
    }, fixture.all);
    guybrush = list.get('name', 'Guybrush Threepwood')[0];
    manny = list.get('name', 'Manny Calavera')[0];
    murray = list.get('name', 'Murray the Demonic Skull')[0];
  });

  afterEach(function() {
    fixture.removeList();
  });

  it('Murray and Guybrush background should be red', function() {
    expect(guybrush.elm.className).to.be('red');
    expect(murray.elm.className).to.be('red');
  });

  it('manny s background should be default', function() {
    expect(manny.elm.className).to.be('');
  });

  it('Guybursh and Many birth date should be default', function() {
    expect($(guybrush.elm).find('.born')[0].className).to.be('born');
    expect($(manny.elm).find('.born')[0].className).to.be('born');
  });

  it('Murray s birth date should be blue', function() {
    expect($(murray.elm).find('.born')[0].className).to.be('born blue');
  });
});