import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { EncryptDecryptService } from '../services/encrypt-decrypt.service';

@Pipe({
  name: 'messageDate'
})
export class MessageDatePipe implements PipeTransform {
  constructor(private encryptDecryptService: EncryptDecryptService) {}
  transform(messages: any[]): any[] {
    const groupedMessages: any[] = [];

    messages.forEach((message, index) => {
      const messageDate = new Date(message?.createdDate);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      let groupHeader = '';
      if (message?.messageText) {
        message.messageText = this.encryptDecryptService?.decryptUsingAES256(
          message?.messageText
        );
      }
      if (message?.parentMessage?.messageText) {
        message.parentMessage.messageText =
          this.encryptDecryptService?.decryptUsingAES256(
            message?.parentMessage?.messageText
          );
      }
      if (messageDate.toDateString() === today.toDateString()) {
        groupHeader = 'Today';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        groupHeader = 'Yesterday';
      } else {
        const date = moment.utc(messageDate).local().toLocaleString();
        groupHeader = moment(date).format('DD-MMM-YYYY');
      }

      if (index === 0 || messageDate.toDateString() !== new Date(messages[index - 1]?.createdDate).toDateString()) {
        groupedMessages.push({ date: groupHeader, messages: [message] });
      } else {
        groupedMessages[groupedMessages.length - 1].messages.push(message);
      }
    });
    // console.log(groupedMessages);
    return groupedMessages;
  }
}
