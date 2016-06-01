var fixture = {
    list: function(valueNames) {
        var listHtml = $('<div id="list"><input class="fuzzy-search" /><ul class="list"></ul></div>'),
            item = "";

        item = "<li>";
        for (var i = 0; i < valueNames.length; i++) {
            item += '<span class="'+valueNames[i]+'"></span>';
        }
        item += "</li>";

        $(document.body).append(listHtml);

        return item;
    },
    removeList: function() {
        $('#list').remove();
    },
    i1: { name: "Guybrush Threepwood", born: 1769 },
    i2: { name: "Manny Calavera", born: 1768 },
    i3: { name: "Bernard Bernoulli", born: 1767 },
    i4: { name: "LeChuck", born: 1766 },
    i5: { name: "Elaine Marley-Threepwood", born: 1765 },
    i6: { name: "Purple Tentacle", born: 1764 },
    i7: { name: "Adrian Ripburger", born: 1763 },
    i8: { name: "Bobbin Threadbare", born: 1762 },
    i9: { name: "Murray the Demonic Skull", born: 1761 },
    i10: { name: "Zak McKracken", born: 1760 }
};
fixture.all = [
    fixture.i1,
    fixture.i2,
    fixture.i3,
    fixture.i4,
    fixture.i5,
    fixture.i6,
    fixture.i7,
    fixture.i8,
    fixture.i9,
    fixture.i10
];