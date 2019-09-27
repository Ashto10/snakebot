module.exports = function SnakeBot() {
    this.helloResponce = {
        counter: 0,
        timeout: null
    }

    this.getHelloCounter = () => {
        return this.helloResponce.counter;
    }

    this.increaseHelloCounter = () => {
        this.helloResponce.counter++;
        if (this.helloResponce.timeout) {
            this.startHelloCounter();
        }
    }

    this.startHelloCounter = () => {
        this.helloResponce.timeout = setTimeout(() => {
            this.helloResponce.counter = 0;
        }, 6000);
    }

    this.resetHelloCounter = () => {
        this.helloResponce.counter = 0;
        clearTimeout(this.helloResponce.timeout);
    }
}