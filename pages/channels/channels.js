// /pages/channels/channels.js
Page({
  ContactService() {
    const button = this.selectComponent('#contactBtn');
    button.triggerEvent('contact');
  }
});