let granted=false
if (Notification.permission === 'granted') {
    granted = true;
} else if (Notification.permission !== 'denied') {
    let permission = Notification.requestPermission();
    granted = permission === 'granted' ? true : false;
}

    const showNotification = (_title,_body) => {
        // create a new notification
        const notification = new Notification(_title, {
            dir: "auto",
            //lang: "hi",
            //badge:'https://www.tradingview.com/x/5K73ypQk',
            //image:'https://www.tradingview.com/x/5K73ypQk',
            body: _body,
            //tag: 'renotify',
            //renotify: true,
            vibrate: [200, 100, 200, 100, 200, 100, 200],
            icon: './assets/icons/binance.png'
            //timestamp:getDateTime('fh')
        });
    }
        const showNotificationBtc = (_title,_body,_icon) => {
            // create a new notification
            const notification = new Notification(_title, {
                dir: "auto",
                //lang: "hi",
                //badge:'https://www.tradingview.com/x/5K73ypQk',
                //image:'https://www.tradingview.com/x/5K73ypQk',
                body: _body,
                //tag: 'renotify',
                //renotify: true,
                vibrate: [200, 100, 200, 100, 200, 100, 200],
                icon: `${_icon>0?'./assets/icons/binance_green.png':'./assets/icons/binance_red.png'}`
                //timestamp:getDateTime('fh')
            });
        }
        // close the notification after 10 seconds
        /*
        setTimeout(() => {
            notification.close();
        }, 5 * 1000);
        */
        // navigate to a URL when clicked
        /*
        notification.addEventListener('click', () => {

            window.open('https://www.javascripttutorial.net/web-apis/javascript-notification/', '_blank');
        });
        */

