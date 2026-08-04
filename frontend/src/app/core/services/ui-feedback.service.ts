import { inject, Service } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Service()
export class UiFeedbackService {
  private toastr = inject(ToastrService);

  success(message: string) {
    this.toastr.success(message);
  }

  error(message: string) {
    this.toastr.error(message);
  }

  async confirmDelete(title = 'Are you sure?') {
    const result = await Swal.fire({
      title,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    return result.isConfirmed;
  }
}
