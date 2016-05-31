describe('Default settings', function() {
    var list,
        itemHTML,
        pagination,
        guybrush,
        manny;

    beforeEach(function() {
        itemHTML = fixture.list(['name', 'born'])
        list = new List('list', {
            valueNames: ['name', 'born'],
            item: itemHTML,
            plugins: [
                ListStyle()
            ]
        }, fixture.all);
        guybrush = list.get('name', 'Guybrush Threepwood')[0];
        manny = list.get('name', 'Manny Calavera')[0];
    });

    afterEach(function() {
        fixture.removeList();
    });

    it('guybrush s background should be red', function() {
        list.style.callback(function(el) {
            if(el.name=="Guybrush Threepwood") {
                el.rowClass = "red";
            }
        });
        expect(guybrush.class).to.be('red');
        expect(manny.class).to.be('');
    });
});