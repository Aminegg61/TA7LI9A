import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarberService } from '../../../services/barber.service';
import { WebsocketService } from '../../../services/websocket.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ServiceCatalogService } from '../../../services/service-catalog.service';
import { AppointmentRequestDTO, AppointmentResponseDTO, BarberSearchDto, ServiceResponseDTO, User } from '../../../models/interfaces';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-950 text-white font-sans">
      <!-- HEADER -->
      <header class="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button (click)="drawerOpen = true" class="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-black italic uppercase tracking-tighter">TA7LI9A</h1>
            <p class="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Client Portal</p>
          </div>
        </div>
        <span class="text-xs font-bold bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
          {{ currentUser?.firstName }} {{ currentUser?.lastName }}
        </span>
        <button (click)="logout()" class="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">
          Logout
        </button>
      </header>

      <!-- DRAWER MODAL -->
      <div *ngIf="drawerOpen" class="fixed inset-0 z-50 flex">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="drawerOpen = false"></div>
        <div class="relative w-80 bg-neutral-900 h-full border-r border-neutral-800 shadow-2xl flex flex-col transform transition-transform">
          <div class="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h2 class="font-black text-lg uppercase tracking-tight italic">Menu</h2>
            <button (click)="drawerOpen = false" class="text-neutral-500 hover:text-white">✕</button>
          </div>
          <div class="p-4 flex-1">
            <button (click)="openSearchModal()" class="w-full text-left px-4 py-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl font-bold transition-all text-sm flex items-center gap-3">
              <span>🔍</span> Search All Barbers
            </button>
          </div>
        </div>
      </div>

      <main class="max-w-xl mx-auto p-4 space-y-6">
        
        <!-- Tab Switcher -->
        <div class="flex bg-neutral-900 p-1 rounded-2xl relative">
          <div class="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 rounded-xl transition-all duration-300"
               [class.left-1]="activeTab === 'favorites'"
               [class.left-[calc(50%+2px)]]="activeTab === 'all'">
          </div>
          <button (click)="activeTab = 'favorites'" 
                  class="flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
                  [class.text-yellow-500]="activeTab === 'favorites'"
                  [class.text-neutral-500]="activeTab !== 'favorites'">
            Favorites
          </button>
          <button (click)="activeTab = 'all'" 
                  class="flex-1 relative z-10 py-3 text-[10px] font-black uppercase tracking-widest transition-colors duration-300"
                  [class.text-yellow-500]="activeTab === 'all'"
                  [class.text-neutral-500]="activeTab !== 'all'">
            My Barbers
          </button>
        </div>

        <!-- Barber Cards -->
        <div class="space-y-4">
          <div *ngIf="displayBarbers.length === 0" class="text-center py-12 text-neutral-500 font-bold text-sm bg-neutral-900 rounded-[2.5rem] border border-neutral-800">
            No barbers found in this list. <br/>
            <button (click)="openSearchModal()" class="text-yellow-500 mt-2 underline">Search to add one</button>
          </div>

          <div *ngFor="let barber of displayBarbers" class="bg-neutral-900 border border-neutral-800 rounded-[2rem] overflow-hidden relative group">
            
            <!-- Context Menu (Remove / Fav) -->
            <div class="absolute top-4 right-4 flex items-center gap-2">
              <button (click)="toggleFavorite(barber.id)" class="p-2 rounded-full bg-neutral-950 border border-neutral-800 transition-all hover:bg-neutral-800">
                <span *ngIf="barber.favorite" class="text-yellow-500">★</span>
                <span *ngIf="!barber.favorite" class="text-neutral-600">☆</span>
              </button>
              <button (click)="removeBarber(barber.id)" class="p-2 rounded-full bg-red-900/20 border border-red-900/30 text-red-500 transition-all hover:bg-red-900/40">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-4 mb-6">
                <!-- Avatar -->
                <div class="relative">
                  <div class="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 font-black text-xl text-neutral-400">
                    {{ barber.firstName.charAt(0) }}{{ barber.lastName.charAt(0) }}
                  </div>
                  <!-- Status Dot -->
                  <div class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-neutral-900"
                       [ngClass]="getStatusColor(barber.currentStatus)"></div>
                </div>
                
                <div>
                  <h3 class="text-2xl font-black italic uppercase tracking-tighter">{{ barber.firstName }} {{ barber.lastName }}</h3>
                  <p class="text-[10px] font-black uppercase tracking-widest mt-1" [ngClass]="getStatusTextColor(barber.currentStatus)">
                    {{ barber.currentStatus }}
                  </p>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
                  <p class="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Queue</p>
                  <p class="font-black text-xl">{{ barber.inQueue ? 'Yes' : 'No' }} <span class="text-xs text-neutral-500 ml-1">in line</span></p>
                </div>
                <div class="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
                  <p class="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-1">Est. Wait</p>
                  <p class="font-black text-xl text-yellow-500">{{ barber.estimatedWaitTime }} <span class="text-xs text-neutral-500 font-bold ml-1">min</span></p>
                </div>
              </div>


<button *ngIf="barber.currentStatus === 'ACTIVE' && !userAppointment"
        (click)="openServiceSelection(barber.id)"
        class="w-full bg-yellow-500 text-black font-black uppercase tracking-widest py-4 rounded-xl hover:bg-yellow-400 transition-all active:scale-[0.98]">
  Send a Demand
</button>

<div *ngIf="userAppointment"
     class="w-full bg-neutral-950 text-neutral-500 text-center font-black uppercase tracking-widest py-4 rounded-xl border border-neutral-800 shadow-inner">
  <span class="flex items-center justify-center gap-2">
    <span class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
    Already In Line
  </span>
</div>

<div *ngIf="barber.currentStatus !== 'ACTIVE' && !userAppointment"
     class="w-full bg-neutral-950 text-neutral-500 text-center font-black uppercase tracking-widest py-4 rounded-xl border border-neutral-800 shadow-inner">
  Not Available currently
</div>
            </div>

            <!-- Accent line -->
            <div class="absolute bottom-0 inset-x-0 h-1.5" [ngClass]="getStatusColor(barber.currentStatus)"></div>
          </div>
        </div>

      </main>

      <!-- SEARCH MODAL -->
      <div *ngIf="searchModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="searchModalOpen = false"></div>
        <div class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">Find Barber</h2>
            <button (click)="searchModalOpen = false" class="text-neutral-500 hover:text-white">✕</button>
          </div>

          <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()" 
                 class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white mb-4 focus:outline-none focus:border-yellow-500" 
                 placeholder="Search by name or phone...">
          
          <div class="overflow-y-auto flex-1 pr-2 -mr-2 space-y-3">
            <div *ngIf="searchResults.length === 0 && searchQuery.length > 2" class="text-center p-4 text-neutral-500 font-bold text-xs mt-4">
              No barbers found.
            </div>
            
            <div *ngFor="let res of searchResults" class="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p class="font-black text-sm">{{ res.firstName }} {{ res.lastName }}</p>
                <p class="text-[10px] uppercase font-bold text-neutral-500 mt-0.5">{{ res.currentStatus }}</p>
              </div>
              <button (click)="addBarber(res.id)" class="bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-lg hover:bg-yellow-400">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SERVICE SELECTION MODAL -->
      <div *ngIf="serviceSelectOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="serviceSelectOpen = false"></div>
        <div class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
          
          <h2 class="text-2xl font-black italic uppercase tracking-tighter mb-2">Request Appt.</h2>
          <p class="text-xs font-bold text-neutral-400 mb-6">Select services you want for this appointment.</p>
          
          <div class="overflow-y-auto flex-1 pr-2 -mr-2 space-y-3">
            <div *ngIf="barberServices.length === 0" class="text-center p-4 text-neutral-500 font-bold text-xs mt-4">
              Loading services or barber has no services set.
            </div>

            <label *ngFor="let srv of barberServices" 
                   class="flex items-center gap-3 bg-neutral-950 border border-neutral-800 p-4 rounded-2xl cursor-pointer hover:border-neutral-600 transition-all"
                   [ngClass]="{'border-yellow-500 bg-yellow-500/5': selectedServices.includes(srv.id)}">
              <input type="checkbox" [value]="srv.id" (change)="toggleService(srv.id)" class="accent-yellow-500 w-4 h-4">
              <div class="flex-1">
                <p class="font-bold text-sm">{{ srv.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[10px] font-black uppercase font-bold text-neutral-500">{{ srv.duration }}</span>
                </div>
              </div>
              <span class="font-black text-yellow-500">{{ srv.price }} MAD</span>
            </label>
          </div>

          <div class="mt-8 flex gap-3 pt-4 border-t border-neutral-800">
            <button (click)="closeModal()" class="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-400 font-black uppercase tracking-widest py-3 rounded-xl hover:text-white">Cancel</button>
            <button (click)="submitRequest()" class="flex-1 bg-yellow-500 text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">Confirm</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ClientDashboard implements OnInit, OnDestroy {
  currentUser: User | null = null;
  activeTab: 'favorites' | 'all' = 'favorites';
  
  myBarbers: BarberSearchDto[] = [];
  myFavorites: BarberSearchDto[] = [];
  
  drawerOpen = false;
  
  searchModalOpen = false;
  searchQuery = '';
  searchResults: BarberSearchDto[] = [];

  serviceSelectOpen = false;
  targetBarberId: number | null = null;
  barberServices: ServiceResponseDTO[] = [];
  selectedServices: number[] = [];
  userAppointment: AppointmentResponseDTO | null = null;
  // private subscriptions: Subscription[] = [];
  private barberSubs: Subscription[] = [];
  private userSubs: Subscription[] = [];
  constructor(
    private auth: AuthService,  
    private router: Router,
    private barberService: BarberService,
    private ws: WebsocketService,
    private appointmentService: AppointmentService,
    private catalogService: ServiceCatalogService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    console.log(this.currentUser);
    
    this.ws.connect();
    this.loadLists();
    // 1. Jib status mlli y-7ell l-app (ila kan dejà m-zid)
    this.loadMyStatus();
    
    // 2. Tsennay l-jdid real-time

       this.initUserWebSocket();

  }

  initUserWebSocket() {
    if (this.currentUser && this.currentUser.id) {
      // Subscribe l l-topic dyal had l-user b-dabt
      const sub = this.ws.subscribeToUser(this.currentUser.id).subscribe(msg => {
        console.log("WebSocket Message received for User:", msg);
        if (msg === 'QUEUE_UPDATED') {
          // Tsenna nos saniya bach Backend y-commit-i l-DB
        
          setTimeout(() => this.loadMyStatus(), 500);
        }
      });
      this.userSubs.push(sub);
    }
  }

  loadMyStatus() {
    this.appointmentService.getMyActiveAppointment().subscribe(res => {

      // 👇 ما تبدل والو إلا modal محلول
      if (this.serviceSelectOpen) return;

      this.userAppointment = res;

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.barberSubs.forEach(s => s.unsubscribe());
    this.userSubs.forEach(s => s.unsubscribe());
    this.ws.disconnect();
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  get displayBarbers() {
    return this.activeTab === 'favorites' ? this.myFavorites : this.myBarbers;
  }

  loadLists() {
    // Unsubscribe from old
    this.barberSubs.forEach(s => s.unsubscribe());
    this.barberSubs = [];

    this.barberService.getMyBarbers().subscribe(list => {
      this.myBarbers = list;
      this.subscribeToBarbers(list);
    });

    this.barberService.getMyFavorites().subscribe(list => {
      this.myFavorites = list;
      this.subscribeToBarbers(list);
    });
  }

  subscribeToBarbers(list: BarberSearchDto[]) {
    this.barberSubs.forEach(s => s.unsubscribe());
    this.barberSubs = [];

    list.forEach(b => {
      const sub = this.ws.subscribeToBarberStatus(b.id).subscribe(newStatus => {
        const update = (arr: BarberSearchDto[]) => {
          const found = arr.find(x => x.id === b.id);
          if (found) found.currentStatus = newStatus as any;
        };

        update(this.myBarbers);
        update(this.myFavorites);

        this.cdr.detectChanges();
      });

      this.barberSubs.push(sub);
    });
  }


  getStatusColor(status: string) {
    if (status === 'ACTIVE') return 'bg-green-500';
    if (status === 'FULL') return 'bg-orange-500';
    return 'bg-neutral-600';
  }

  getStatusTextColor(status: string) {
    if (status === 'ACTIVE') return 'text-green-500';
    if (status === 'FULL') return 'text-orange-500';
    return 'text-neutral-500';
  }

  toggleFavorite(barberId: number) {
    this.barberService.toggleFavorite(barberId).subscribe(() => {
      this.loadLists();
    });
  }

  removeBarber(barberId: number) {
    this.barberService.removeBarber(barberId).subscribe(() => {
      this.loadLists();
    });
  }

  // --- Search functionality ---
  openSearchModal() {
    this.searchModalOpen = true;
    this.drawerOpen = false;
    this.searchQuery = '';
    this.searchResults = [];
  }

  onSearch() {
    if (this.searchQuery.length > 2) {
      this.barberService.searchBarbers(this.searchQuery).subscribe(res => {
        this.searchResults = res;
      });
    } else {
      this.searchResults = [];
    }
  }

  addBarber(id: number) {
    this.barberService.addBarber(id).subscribe(() => {
      this.searchModalOpen = false;
      this.loadLists();
      this.activeTab = 'all'; // switch to all tab to show it
    });
  }

  // --- Appointment Request ---
  openServiceSelection(barberId: number) {
    console.log(this.serviceSelectOpen);
    
    this.targetBarberId = barberId;
    this.selectedServices = [];
    this.barberServices = [];
    this.catalogService.getBarberServices(barberId).subscribe(res => {
    console.log("SERVICES:", res); // 👈 مهم
    this.barberServices = res;
    this.serviceSelectOpen = true;   
    this.cdr.detectChanges();
  });



  }

  toggleService(id: number) {
    const idx = this.selectedServices.indexOf(id);
    if (idx > -1) {
      this.selectedServices.splice(idx, 1);
    } else {
      this.selectedServices.push(id);
    }
  }
  closeModal() {
    this.serviceSelectOpen = false;
    this.cdr.detectChanges();
  }

  submitRequest() {
    if (this.selectedServices.length === 0 || !this.targetBarberId) return;
    
    const payload: AppointmentRequestDTO = {
      barberId: this.targetBarberId,
      serviceIds: this.selectedServices,
      manualName: '',   // Beddel null b string khawi
      clientId: undefined // Blast null, ista3mel undefined ila kan optional
    };

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        console.log(payload);
        
        this.serviceSelectOpen = false;
        this.loadLists();
      }
    });
  }
}
