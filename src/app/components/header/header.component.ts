import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, debounceTime, tap } from 'rxjs/operators';

import { CategoryService } from 'src/app/services/category.service';

import { Category } from 'src/app/models/category.model';
import { Product } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  store: any = {
    name: 'Infoway',
  };

  provider = false;
  user = false;

  openedMenu: boolean = false;
  openedLogin: boolean = false;

  signOut(): void {
    window.sessionStorage.clear();
    window.location.href = 'http://localhost:4200';
  }

  toggleMenu() {
    this.openedMenu = !this.openedMenu;
    this.closeLogin();
  }

  closeMenu() {
    this.openedMenu = false;
  }

  toggleLogin() {
    console.log('clicou');
    this.openedLogin = !this.openedLogin;
    this.closeMenu();
  }

  closeLogin() {
    this.openedLogin = false;
  }

  categories: Category[] = [];
  featuredCategories: Category[] = [];

  searchFormGroup: FormGroup;
  searchText: string = '';
  searchTextNotFound: string = '';
  foundProducts: Product[] = [];

  userAvartar: string = '';

  constructor(
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _categoryService: CategoryService,
    private _productService: ProductService,
    private _getTokenService: TokenStorageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.formConfig();
    this.findProducts();
    this.provider =
      this._getTokenService.getUser().roles === 'ROLE_ADMIN' ? true : false;
    this.user =
      this._getTokenService.getUser().roles === 'ROLE_USER' ? true : false;
    this.userAvartar = this._getTokenService.getToken();
  }

  getCategories(): void {
    this._categoryService.getAll().subscribe(
      (response) => {
        this.categories = response;
        this.featuredCategories = this.categories.filter(
          (category) => category.featured
        );
      },
      (error) => console.log(error)
    );
  }

  navigateToProductList(selectedCategory: Category): void {
    this._router.navigate(['products'], {
      queryParams: { category: selectedCategory.id },
      skipLocationChange: false,
    });
  }

  navigateToSelectedProduct(id: number): void {
    this.clearSearch();
    this._router.navigateByUrl('/products/' + id);
  }

  formConfig(): void {
    this.searchFormGroup = this._formBuilder.group({
      searchInput: [''],
    });
  }

  findProducts(): void {
    this.searchFormGroup
      .get('searchInput')
      .valueChanges.pipe(debounceTime(400))
      .subscribe((value: string) => {
        if (!value || value.trim().length == 0) {
          this.clearSearch();
        } else {
          this.searchText = value;
          this.getProductsByName();
        }
      });
  }

  getProductsByName(): void {
    this._productService.getAllByParams({ name: this.searchText }).subscribe(
      (response) => {
        this.foundProducts = response;
        this.searchTextNotFound = '';
      },
      (error) => {
        console.log(error);
        this.searchTextNotFound = 'Nenhum produto encontrado';
      }
    );
  }

  clearSearch(): void {
    this.searchFormGroup.get('searchInput').reset();
    this.searchText = '';
    this.searchTextNotFound = '';
    this.foundProducts = [];
  }

  avatarUrl: string = '';

  getUserAvatar(login: string): void {
    console.log(login);

    this.userService.getUserAvatarr(login).subscribe((data) => {
      this.avatarUrl = data;

      console.log('header' + data);

      this._getTokenService.saveUserAvatar(data);
    });
  }
}
