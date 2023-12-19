import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core'
import { MessageService, SelectItem } from 'primeng/api'
import { Table } from 'primeng/table'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import {
  Action,
  AUTH_SERVICE,
  IAuthService,
  ConfigurationService,
  MicroFrontend,
  MicrofrontendRegistration,
  MicrofrontendDTO,
  MfePortalRegistration,
  Portal,
  PortalApiService,
  DataViewControlTranslations,
} from '@onecx/portal-integration-angular'

// import { ONECX_PORTAL_SUPER_ADMIN_ROLE } from '../constants'
import { ProductAbstract, ProductPageResult, ProductsAPIService, ProductSearchCriteria, SearchProductsRequestParams } from '../../generated'
import { limitText, setFetchUrls } from '../../shared/utils'
import { finalize, Observable } from 'rxjs'

export type MfeAvailable = MicrofrontendDTO & { used?: boolean }
export type MfeRegistered = MicrofrontendRegistration & MicroFrontend & { ok?: boolean }

@Component({
  selector: 'onecx-mfe-config',
  templateUrl: './mfe-config.component.html',
  styleUrls: ['./mfe-config.component.scss'],
})
export class MfeConfigComponent implements OnInit {
  public config: { [key: string]: string } | undefined
  public portal: Portal | undefined
  public actions: Action[] = []

  // mfes: A-Avaliable, R-Registered
  public selectedMfe: MfeAvailable | undefined
  public mfeAList: MfeAvailable[] = []
  public mfeRList: MfeRegistered[] = []
  public mfeAMap: Map<string, MfeAvailable> = new Map()

  public mfeALoading = true
  public mfeAColumns: object[] = []
  public mfeATablePageReport = ''
  public mfeATableFilterColumns = ''

  public mfeRLoading = true
  public mfeRColumns: object[] = []
  public mfeRTablePageReport = ''
  public mfeRTableFilterColumns = ''

  // application tiles overview
  public productAbstractSearchResult: ProductPageResult['stream'] = []
  public viewMode = 'grid'
  public filter: string | undefined
  public sortField = ''
  public sortOrder = 1
  public defaultSortField = 'applicationName'
  public fieldLabelProductName = ''
  public fieldLabelProductId = ''
  public dataViewControlsTranslations: DataViewControlTranslations = {}
  public limitText = limitText
  public searchInProgress = false
  public products$!: Observable<ProductPageResult[]>
  public placeholderProductDescription = ''
  public productPlaceHolderPath = '/assets/images/product_image_placeholder.png'

  @ViewChild('mfeATable') mfeATable: Table | undefined
  @ViewChild('mfeRTable') mfeRTable: Table | undefined
  @ViewChild('mfeATableFilterInput') mfeATableFilter: ElementRef | undefined
  @ViewChild('mfeRTableFilterInput') mfeRTableFilter: ElementRef | undefined
  @ViewChild('table', { static: false }) table!: DataView | any

  // initial settings
  public activeIndex = 0
  public dateFormat = 'short'
  public showDetailDialog = false
  public modeDetailDialog = 'NEW'
  public mfeDeleteVisible = false
  public mfeDeleteMessage = ''
  private mfeDeleteSelected: MfeAvailable | undefined

  public hasPermission = false
  public selectedPortalId = ''
  public availablePortals!: SelectItem[]

  constructor(
    private translate: TranslateService,
    private configService: ConfigurationService,
    private portalService: PortalApiService,
    private productService: ProductsAPIService,
    private msgService: MessageService,
    @Inject(AUTH_SERVICE) readonly auth: IAuthService
  ) {
    this.initTranslations()
    this.dateFormat = this.configService.lang === 'de' ? 'dd.MM.yyyy HH:mm' : 'short'
    this.hasPermission = this.auth.hasPermission('PRODUCT_STORE_MODULES_REGISTERED#SELECT')
  }

  ngOnInit() {
       
    this.loadAllProducts()
  }



  
  // loading translations via http (=> TranslationLoader) needs time... so we have to wait
  async initTranslations() {
    this.loadProductOverviewTranslations()
  }


  loadProductSearchSortingCriteria() {
    this.fieldLabelProductName = this.translate.instant('PRODUCT_SEARCH.FILTER_NAME_PRODUCT_NAME')
    this.fieldLabelProductId = this.translate.instant('PRODUCT_SEARCH.FILTER_NAME_PRODUCT_ID')
  }

  /*
   * Initialize translation related to the product overview page
   */
  loadProductOverviewTranslations() {
    this.loadProductSearchSortingCriteria()
    this.dataViewControlsTranslations = {
      viewModeToggleTooltips: {
        grid: this.translate.instant('PRODUCT_SEARCH.TOOLTIPS.VIEW_MODE_GRID'),
        list: this.translate.instant('PRODUCT_SEARCH.TOOLTIPS.VIEW_MODE_LIST'),
      },
      filterInputPlaceholder: this.translate.instant('GENERAL.FILTER_PLACEHOLDER'),
      filterInputTooltip:
        this.translate.instant('GENERAL.TOOLTIPS.FILTER') +
        this.fieldLabelProductName +
        ', ' +
        this.fieldLabelProductId,
      sortOrderTooltips: {
        ascending: this.translate.instant('PRODUCT_SEARCH.TOOLTIPS.SORT_DIRECTION_ASC'),
        descending: this.translate.instant('PRODUCT_SEARCH.TOOLTIPS.SORT_DIRECTION_DESC'),
      },
      sortDropdownTooltip: this.translate.instant('PRODUCT_SEARCH.SORT_BY'),
    }
  }



 


 
  

 

  onFilterChange(event: string): void {
    this.table.filter(event, 'contains')
  }

  onLayoutChange(viewMode: string) {
    this.viewMode = viewMode
  }

  onSortChange(field: string) {
    this.sortField = field
  }
  onSortDirChange(asc: boolean) {
    this.sortOrder = asc ? -1 : 1
  }

  // get all products for tile view by generic search
  private loadAllProducts(): void {
    this.searchInProgress = true
    const searchCriteria: ProductSearchCriteria = {}
    // default values to fetch all available products
    searchCriteria.name = ""
    searchCriteria.pageNumber = 0
    searchCriteria.pageSize = 1000
    const searchRequest: SearchProductsRequestParams = {
      productSearchCriteria: searchCriteria
    }
    this.productService
      .searchProducts(searchRequest)
      .pipe(finalize(() => (this.searchInProgress = false)))
      .subscribe({
        next: (productPageResult) => {
          this.productAbstractSearchResult = productPageResult.stream
          if (productPageResult.stream?.length === 0) {
            this.msgService.add({
              severity: 'success',
              summary: this.translate.instant('PRODUCT_SEARCH.MSG_NO_RESULTS'),
            })
          }
          this.sortField = this.defaultSortField
        },
        error: () => {
          this.msgService.add({
            severity: 'error',
            summary: this.translate.instant('PRODUCT_SEARCH.ERROR'),
          })
        },
      })
  }

  getDescriptionString(text: string): string {
    if (text) {
      const chars = window.innerWidth < 1200 ? 200 : 120
      return text.length < chars ? text : text.substring(0, chars) + '...'
    } else {
      return this.placeholderProductDescription
    }
  }

  // Not yet used
  public onGotoApplicationDetails(ev: any, productAbstract: ProductPageResult) {
    ev.stopPropagation()
    //window.open(window.document.location.href + '../../../..' + application.url, '_blank')
  }

  /*
   * Ensure image url is a external reference, otherwise return default placeholder image
   */
  public prepareProductImageUrl(imageUrl: string): string {
    // if image URL does not start with a http(s), then use placeholder as default one.
    if (!imageUrl || !imageUrl.match(/^(http|https)/g)) {
      imageUrl = setFetchUrls(location.origin, this.productPlaceHolderPath)
    } else {
      if (imageUrl && imageUrl.match(/^(http|https)/g)) {
        return imageUrl
      }
    }
    return imageUrl
  }
}
