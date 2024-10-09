import { Directive, HostListener, Renderer2 } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
@Directive({
  selector: '[hoverDropdown]',
})
export class HoverDropdownDirective {
  private dropdownElement: HTMLElement | null = null;
  private static activeDropdown: HoverDropdownDirective | null = null;

  constructor(
    private renderer: Renderer2,
    private customerService: CustomerService,
    private router: Router,
    private toastService: ToastService
  ) {}

  @HostListener('mouseover', ['$event.target']) onMouseHover(
    target: HTMLElement
  ) {
    if (target.tagName === 'A' && target.hasAttribute('data-id')) {
      const id = +target.getAttribute('data-id');
      this.createDropdown(target, id);
    }
  }

  // @HostListener('mouseleave') onMouseLeave() {
  //   this.hideDropdown();
  // }

  private createDropdown(anchorElement: HTMLElement, id: number) {
    if (
      HoverDropdownDirective.activeDropdown &&
      HoverDropdownDirective.activeDropdown !== this
    ) {
      HoverDropdownDirective.activeDropdown.hideDropdown();
    }
    HoverDropdownDirective.activeDropdown = this;
    if (this.dropdownElement) {
      this.renderer.removeChild(document.body, this.dropdownElement);
    }

    this.dropdownElement = this.renderer.createElement('div');
    this.renderer.addClass(
      this.dropdownElement,
      'hover-directive-box-container'
    );

    this.customerService.getProfile(id).subscribe({
      next: (res: any) => {
        if (res.data && res.data.length > 0) {
          const profilePicUrl = res.data[0]?.ProfilePicName || '/assets/images/avtar/placeholder-user.png';
          const content = `
                <div class="d-flex flex-column">
                  <img
                    class="w-48-px h-48-px rounded-4"
                    loading="lazy"
                    src="${profilePicUrl}"
                    alt="avatar"
                  />
                  <div class="d-flex gap-3 align-items-baseline">
                  ${anchorElement.outerHTML}
                    <button class="dropdown-button-copy"">
                      <fa-icon class="ng-fa-icon" ng-reflect-icon="fas,copy"><svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="copy" class="svg-inline--fa fa-copy" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M208 0H332.1c12.7 0 24.9 5.1 33.9 14.1l67.9 67.9c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48zM48 128h80v64H64V448H256V416h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48z"></path></svg></fa-icon>
                    </button>
                  </div>
                  <button class="dropdown-button-msg">
                  <a
                    class="droplist d-flex align-items-center gap-2 mt-1"
                  >
                    <fa-icon class="ng-fa-icon" ng-reflect-icon="fas,envelope"><svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="envelope" class="svg-inline--fa fa-envelope" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"></path></svg></fa-icon>
                    <span>Messaging</span>
                  </a>
                </button>
                </div>`;
          this.dropdownElement.innerHTML = content;
          this.renderer.appendChild(document.body, this.dropdownElement);
          const anchorRect = anchorElement.getBoundingClientRect();
          this.renderer.setStyle(
            this.dropdownElement, 
            'position', 
            'absolute'
          );
          this.renderer.setStyle(
            this.dropdownElement,
            'top',
            `${anchorRect.bottom + window.scrollY}px`
          );
          this.renderer.setStyle(
            this.dropdownElement,
            'left',
            `${anchorRect.left + window.scrollX}px`
          );
          this.renderer.listen(this.dropdownElement, 'mouseleave', () =>
            this.hideDropdown()
          );
          const button = this.dropdownElement.querySelector(
            '.dropdown-button-copy'
          );
          if (button) {
            button.addEventListener('click', (e) => {
              e.stopPropagation();
              this.copyToClipboard(`${anchorElement.innerText}`);
            });
          }
          const msgButton = this.dropdownElement.querySelector(
            '.dropdown-button-msg'
          );
          if (msgButton) {
            msgButton.addEventListener('click', (e) => {
              e.stopPropagation();
              this.selectMessaging(res.data[0]);
            });
          }
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
      },
    });
  }

  private hideDropdown() {
    if (this.dropdownElement) {
      this.renderer.removeChild(document.body, this.dropdownElement);
      this.dropdownElement = null;
    }
    if (HoverDropdownDirective.activeDropdown === this) {
      HoverDropdownDirective.activeDropdown = null;
    }
  }

  private copyToClipboard(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.toastService.success('Link has been copied to clipboard');
  }

  private selectMessaging(data) {
    const userData = {
      Id: data.profileId,
      ProfilePicName: data.ProfilePicName,
      Username: data.Username,
    };
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    const url = this.router
      .createUrlTree(['/profile-chats'], {
        queryParams: { chatUserData: encodedUserData },
      })
      .toString();
    window.open(url, '_blank');
  }
}
