import { AdminClaimListService } from '../../_services/admin-claim-list.service';
import { Component, OnInit } from '@angular/core';
import { ConfirmationDialogService } from '../../_services/confirmation-dialog/confirmation-dialog.service';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { ToasterService } from 'angular2-toaster';
import { UserService } from "../../_services";

@Component({
  selector: 'app-admin',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public headElements = ['№', 'Full Name', 'Phone', 'Email', 'Type', 'Message', 'Created', ''];
  public loaded = false;
  public toasterService: ToasterService;

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    public adminClaimListService: AdminClaimListService,
    toasterService: ToasterService,
  ) {
    this.toasterService = toasterService;
  }

  ngOnInit() {
    this.getClaims();
    this.toasterService.pop('success', '', 'Hello Igor )');
  }

  getClaims() {
    this.loaded = false;
    this.adminClaimListService.getClaims()
      .pipe(first())
      .subscribe((user: any) => {
          this.loaded = true;
        },
        error => {
          this.toasterService.pop('error', '', error.message);
        });
  }

  removeClaim(id) {
    this.confirmationDialogService.confirm('Delete..', 'Do you really want to delete?')
      .then((confirmed) => {
        if (confirmed) {
          this.loaded = false;
          this.adminClaimListService.removeClaim(id)
            .subscribe((claim) => {
                const claimId = claim['id'];
                this.adminClaimListService.claims = this.adminClaimListService.claims.filter(cl => cl.id !== claimId);
                this.loaded = true;
                this.toasterService.pop('success', '', 'Deleted');
                this.getClaims();
              },
              error => {
                this.toasterService.pop('error', '', error.message);
              });
        }
      });
  }

  logout() {
    this.userService.logout()
      .subscribe((resourse: any) => {
          if (resourse) {
            this.router.navigate(['/admin']);
          }
        },
        error => {
          this.toasterService.pop('error', '', error.message);
      });
  }
}
