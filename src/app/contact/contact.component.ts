import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Contact } from '../models/contact.model';
import { ApiService } from '../shared/api/api.service';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  loading: boolean = false;
  @Input()
  contact!: Contact;

  @HostBinding('class') columnClass = 'four wide column';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  updateContact(contact: Contact): void {
    const id = contact._id || "";
    this.router.navigateByUrl(`/new/${id}`);
  }

  deleteContact(contact: Contact): void {
    const id = contact._id || "";
    this.loading = true;
    this.apiService.delete('contacts', id)
    .subscribe({
      next: (data) => {
      this.loading = false;
      // this.router.navigate(['/contacts']);
      window.location.reload();
    },
    error: (err) =>  {
      console.log(err);
    }
  });
  }

}
