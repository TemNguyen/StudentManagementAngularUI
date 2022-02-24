import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Gender } from 'src/app/models/ui-models/gender.model';
import { Student } from 'src/app/models/ui-models/students.model';
import { GenderService } from 'src/app/services/gender.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css']
})
export class ViewStudentComponent implements OnInit {
  studentId: string | null | undefined;
  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    profileImageUrl: '',
    genderId: '',
    gender: {
      id: '',
      description: ''
    },
    address: {
      id: '',
      physicalAddress: '',
      postalAddress: '',
      studentId: ''
    }
  }

  isNewStudent = true;
  header = ''
  displayProfileImageUrl = '';

  genderList: Gender[] = [];

  @ViewChild('studentDetailsForm') studentDetailsForm?: NgForm;

  constructor(private readonly studentServices: StudentService,
    private readonly route: ActivatedRoute,
    private readonly genderService: GenderService,
    private snackbar: MatSnackBar,
    private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      (params) => {
        this.studentId = params.get('id');

        if (this.studentId) {
          if (this.studentId.toLowerCase() === 'Add'.toLowerCase()) {
            // New
            this.isNewStudent = true;
            this.header = 'Add New Student'
            this.setImage();
          } else {
            // Edit
            this.isNewStudent = false;
            this.header = 'Edit Student'

            this.studentServices.getStudent(this.studentId).subscribe(
              (successResponse) => {
                this.student = successResponse;
                this.setImage();
              },
              (errorResponse) => {
                this.setImage();
              }
            );
          }

          this.genderService.getGenderList()
          .subscribe(
            (successResponse) => {
              this.genderList = successResponse;
            }
          )
        }
      }
    )
  }

  onUpdate(): void {
    this.studentServices.updateStudent(this.student.id, this.student)
    .subscribe(
      (successResponse) => {
        this.snackbar.open('Student Updated Successfully', undefined, {
          duration: 2000
        });
      },
      (errorResponse) => {
        console.log(errorResponse);
      }
    )
  }

  onDelete(): void {
    this.studentServices.deleteStudent(this.student.id)
    .subscribe(
      (successResponse) => {
        this.snackbar.open('Student deleted successfuly', undefined, {
          duration: 2000
        });

        setTimeout(() => {
          this.router.navigateByUrl('students');
        }, 2000);

      },
      (errorResponse) => {
        console.log('someError');
      }
    )
  }

  onAdd(): void {

    if (this.studentDetailsForm?.form.valid) {
      this.studentServices.addStudent(this.student)
      .subscribe(
        (successResponse) => {
          this.snackbar.open('Student added successfully', undefined, {
            duration: 2000
          });

          setTimeout(() => {
            this.router.navigateByUrl(`students/${successResponse.id}`)
          }, 2000);
        },
        (errorResponse) => {
          console.log(errorResponse);
        }
      )
    }

  }

  uploadImage(event: any): void {
    if (this.studentId) {
      const file: File = event.target.files[0];

      this.studentServices.uploadImage(this.student.id, file)
      .subscribe(
        (successResponse) => {
          this.student.profileImageUrl = successResponse;
          this.setImage();

          this.snackbar.open('Profile Image Updated!', undefined, {
            duration: 2000
          });

          setTimeout(() => {
            this.router.navigateByUrl(`students/${this.student.id}`);
          }, 2000);
        },
        (errorResponse) => {
          console.log(errorResponse);
        }
      )
    }
  }

  private setImage(): void {
    if (this.student.profileImageUrl) {
      this.displayProfileImageUrl = this.studentServices.getImagePath(this.student.profileImageUrl);
    } else {
      this.displayProfileImageUrl = '/assets/default-user.jpg';
    }
  }

}
