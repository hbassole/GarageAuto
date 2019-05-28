module.exports = function Car(car){

    this.items=car.items || {};
    this.totalItems=car.totalItems || 0;
    this.totalPrice=car.totalPrice || 0;

    this.add=function(item,idl){

        var carItem=this.items[idl];
        if (!carItem) {
            carItem=this.items[idl]={item:item, quantity:0, price:0};
        }
        carItem.quantity++;
        carItem.price=carItem.item.price * carItem.quantity;
        this.totalItems++;
        this.totalPrice+=carItem.item.price;
    };

    this.remove=function(idl){

        this.totalItem-= this.items[idl].quantity;
        this.totalItem-= this.items[idl].price;
        delete this.items[idl];
    };

    this.getItems = function() {

        var arr=[];
        for (var idl in this.items) {
            arr.push(this.items[idl]);
        }
        return arr;
    };
};