import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-signup',
  imports: [CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  message = '';

  showDemoMessage() {
    this.message =
      'Demo only: In the actual HMS workflow, employee accounts are created by the Admin. Click on the Login Button To Continue ';
  }

}