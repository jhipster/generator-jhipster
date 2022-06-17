jest.mock('app/core/auth/account.service');
jest.mock('app/login/login.service');

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { LoginService } from 'app/login/login.service';

import { HomeComponent } from './home.component';

describe('Home Component', () => {
  let comp: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockAccountService: AccountService;
  let mockLoginService: LoginService;
  const account: Account = {
    activated: true,
    authorities: [],
    email: '',
    firstName: null,
    langKey: '',
    lastName: null,
    login: 'login',
    imageUrl: null,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      providers: [AccountService, LoginService],
    })
      .overrideTemplate(HomeComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    comp = fixture.componentInstance;
    mockAccountService = TestBed.inject(AccountService);
    mockAccountService.identity = jest.fn(() => of(null));
    mockAccountService.getAuthenticationState = jest.fn(() => of(null));
    mockLoginService = TestBed.inject(LoginService);
  });

  describe('ngOnInit', () => {
    it('Should synchronize account variable with current account', () => {
      // GIVEN
      mockAccountService.identity = jest.fn(() => of(account));

      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.account).toEqual(account);
    });
  });

  describe('login', () => {
    it('Should call loginService.login on login', () => {
      // WHEN
      comp.login();

      // THEN
      expect(mockLoginService.login).toHaveBeenCalled();
    });
  });
});
