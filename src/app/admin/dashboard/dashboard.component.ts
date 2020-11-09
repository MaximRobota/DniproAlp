import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ToasterService} from 'angular2-toaster';
import {AdminClaimListService} from '../../_services/admin-claim-list.service';
import {delay} from 'rxjs/operators';
import { ConfirmationDialogService } from '../../_services/confirmation-dialog/confirmation-dialog.service';


@Component({
  selector: 'app-admin',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  public loaded = false;
  public headElements = ['№', 'Full Name', 'Phone', 'Email', 'Type', 'Message', 'Created At', ''];
  public toasterService: ToasterService;

  constructor(
    toasterService: ToasterService,
    private http: HttpClient,
    public adminClaimListService: AdminClaimListService,
    private confirmationDialogService: ConfirmationDialogService
  ) {    this.toasterService = toasterService;
  }

  ngOnInit() {
    this.getClaims();
    this.toasterService.pop('success', '', 'Hello Igor )');
  }

  getClaims() {
    this.loaded = false;
    this.adminClaimListService.getClaims()
      .pipe(delay(2000))
      .subscribe(() => {
      this.loaded = true;
    },
    error => {
      this.toasterService.pop('error', '', error.message);
    });
  }

  removeClaim(id) {
    this.confirmationDialogService.confirm('Delete..', 'Do you really want to delete?')
      .then((confirmed) => {
        console.log(confirmed);
        if (confirmed) {
          this.loaded = false;
          this.adminClaimListService.removeClaim(id).subscribe((claim) => {
              const claimId = claim['_id'];
              this.adminClaimListService.claims = this.adminClaimListService.claims.filter(cl => cl._id !== claimId);
              this.loaded = true;
            },
            error => {
              this.toasterService.pop('error', '', error.message);
            });
        }
      });
  }
}
