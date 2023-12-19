import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import {
  ConfigurationService,
  PageContentComponent,
  PageHeaderComponent,
  PortalMessageService,
  PortalPageComponent,
  PrimeNgModule,
  MockAuthModule,
} from '@onecx/portal-integration-angular'
import { HttpClientTestingModule } from '@angular/common/http/testing'

import { MfeConfigComponent } from './mfe-config.component'
import { RouterTestingModule } from '@angular/router/testing'
import { TabViewModule } from 'primeng/tabview'
import { PanelModule } from 'primeng/panel'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule } from '@angular/forms'

describe('MfeConfigComponent', () => {
  let component: MfeConfigComponent
  let fixture: ComponentFixture<MfeConfigComponent>
  const mockConfigurationService = {
    lang: jest.fn(),
    getConfig: jest.fn(),
    getPortal: jest.fn(() => {
      return { id: 'id1', portalName: 'PortalName' }
    }),
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({})),
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        PrimeNgModule,
        RouterTestingModule,
        TabViewModule,
        PanelModule,
        NoopAnimationsModule,
        FormsModule,
        MockAuthModule,
      ],
      declarations: [MfeConfigComponent, PortalPageComponent, PageHeaderComponent, PageContentComponent],
      providers: [
        {
          provide: ConfigurationService,
          useValue: mockConfigurationService,
        },
        {
          provide: PortalMessageService,
          useClass: PortalMessageService,
        },
      ],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(MfeConfigComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
