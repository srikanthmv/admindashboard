import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {UserModel} from '../../../models/user.model';
import {UserService} from '../../../services/admin/users/user.service';
import {MatSort} from '@angular/material/sort';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {FormControl} from '@angular/forms';
import {SelectionModel} from '@angular/cdk/collections';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['select', 'id', 'name', 'email', 'role', 'actions'];
  usersList: MatTableDataSource<UserModel>| undefined;
  pageEvent: PageEvent | undefined;
  filterTextInput: FormControl = new FormControl();
  selection: SelectionModel<UserModel> | undefined;
  listOfUsersToDelete: UserModel[] = [];
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;
  @ViewChild(MatSort, {static: true}) sort: MatSort | undefined;
  constructor(private userService: UserService, private notificationBar: MatSnackBar) {
    this.setPaginationDefaults();
    this.setSelectionDefaults();
  }

  setSelectionDefaults(): void {
    const initialSelection: any[] = [];
    const allowMultiSelect = true;
    this.selection = new SelectionModel<UserModel>(allowMultiSelect, initialSelection);
  }

  setPaginationDefaults(): void {
    this.pageEvent = new PageEvent();
    this.pageEvent.pageIndex = 0;
    this.pageEvent.previousPageIndex = 0;
    this.pageEvent.pageSize = 10;
  }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.userService.getAllUsers().subscribe((resp) => {
      this.usersList = new MatTableDataSource(resp);
      this.setPaginationAndSorting();
    });
  }

  /* assigns the paginator and sorting instances to users data to enable sorting and pagination */
  setPaginationAndSorting(): void {
    if (this.usersList && this.paginator && this.sort) {
      this.usersList.paginator = this.paginator;
      this.usersList.sort = this.sort;
    }
  }

  applyFilter(): void {
    if (this.usersList !== undefined) {
      this.usersList.filter = this.filterTextInput?.value.trim().toLowerCase();
      if (this.usersList.paginator) {
        this.usersList.paginator.firstPage();
      }
    }
  }

  paginationHandler(event: PageEvent): void {
    this.pageEvent = event;
    this.setSelectionDefaults();
  }

  resetFilters(): void {
    this.filterTextInput.setValue('');
    this.applyFilter();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const paginationSets = this.getCurrentAndMaxIndex() as {currentIndex: number, maxIndex: number};
    const numSelected = this.selection?.selected.length;
    const numRows = this.usersList?.data.slice(paginationSets.currentIndex, paginationSets.maxIndex).length;
    return numSelected === numRows;
  }

  selectUser(event: MatCheckboxChange, row: UserModel): void {
    if (event) {
      this.selection?.toggle(row);
      this.selection?.selected.forEach((selectedUserInfo) => {
        this.listOfUsersToDelete.push(selectedUserInfo);
      });
    } else {
      if (this.listOfUsersToDelete.length) {
        const userInfoIndex = this.listOfUsersToDelete.findIndex((user) => user.id === row.id);
        this.listOfUsersToDelete.splice(userInfoIndex, 1);
      }
    }
  }

  toggleSelectAll(): void {
    const paginationSets = this.getCurrentAndMaxIndex() as {currentIndex: number, maxIndex: number};
    if (this.isAllSelected()) {
      this.selection?.clear();
      this.listOfUsersToDelete = [];
    } else {
      const slicedUsersList = this.usersList?.data.slice(paginationSets.currentIndex, paginationSets.maxIndex);
      slicedUsersList?.forEach(row => this.selection?.select(row));
      if (slicedUsersList) {
        this.listOfUsersToDelete = slicedUsersList;
      }
    }
  }

  deleteSingleUser(row: UserModel): void {
    this.listOfUsersToDelete.push(row);
    this.deleteSelectedUsers();
  }

  deleteSelectedUsers(): void {
    /* list of users whom are selected for deletion will be on the listOfUsersToDelete. By looping through it
    * we will find the user in the original usersList and splice the usersList and update it back to render
    * the fresh list in the UI, also we will reset the selection and pagination to defaults */
    if (this.listOfUsersToDelete.length) {
      this.listOfUsersToDelete.forEach((userInfo) => {
        const userIndexInMainList = this.usersList?.data.findIndex((user) => userInfo.id === user.id);
        if (userIndexInMainList !== undefined) {
          this.usersList?.data.splice(userIndexInMainList, 1);
          this.usersList = new MatTableDataSource<UserModel>(this.usersList?.data);
          this.setSelectionDefaults();
          this.setPaginationAndSorting();
          if (this.selection?.selected !== undefined) {
            this.notificationBar.open(
              `user${this.listOfUsersToDelete.length > 1 ? 's' : ''} deleted successfully`,
              'dismiss');
          }
        }
      });
    }
  }

  getCurrentAndMaxIndex(): {currentIndex: number, maxIndex: number} {
    /* change the current index and max index to splice the users list. below are the conditions
    * 1. if user is on the page 1, the default pageIndex and pageSize will be the currentIndex and maxIndex
    * 2. if user navigates to the next page, currentIndex will be multiplied with the pageIndex and pageSize.
    * where as, the maxIndex will be added to the currentIndex */

    let currentIndex: number | undefined = 0;
    let maxIndex: number | undefined = 0;
    if (this.pageEvent !== undefined) {
      if (this.pageEvent?.pageIndex === 0 && this.pageEvent?.pageSize === 10) {
        currentIndex = this.pageEvent.pageIndex;
        maxIndex = this.pageEvent.pageSize;
      } else {
        currentIndex = (this.pageEvent?.pageIndex * this.pageEvent?.pageSize);
        maxIndex = this.pageEvent.pageSize + currentIndex;
      }
    }
    return {currentIndex, maxIndex};
  }

}
