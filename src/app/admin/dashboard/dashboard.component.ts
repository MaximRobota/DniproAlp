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
  private loaded = false;
  public headElements = ['№', 'Full Name', 'Phone', 'Email', 'Type', 'Message', 'Created At', ''];
  public toasterService: ToasterService;

  constructor(
    toasterService: ToasterService,
    private http: HttpClient,
    private adminClaimListService: AdminClaimListService,
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

  removeClaims(id) {
    // this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to ... ?')
    //   .then((confirmed) => console.log('User confirmed:', confirmed))
    //   .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
    //

    this.loaded = false;
    this.adminClaimListService.removeClaims(id).subscribe((claim) => {
        const claimId = claim['_id'];
        this.adminClaimListService.claims = this.adminClaimListService.claims.filter(cl => cl._id !== claimId);
        this.loaded = true;
      },
    error => {
      this.toasterService.pop('error', '', error.message);
    });
  }
}
