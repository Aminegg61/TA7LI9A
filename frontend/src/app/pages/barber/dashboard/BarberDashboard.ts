import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BarberService } from '../../../services/barber.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ServiceCatalogService } from '../../../services/service-catalog.service';
import { AuthService } from '../../../services/auth';
import { AppointmentResponseDTO, ServiceResponseDTO, User } from '../../../models/interfaces';
import { WebsocketService } from '../../../services/websocket.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-barber-dashboard',
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
            <h1 class="text-xl font-black italic uppercase tracking-tighter">BARBER STATION</h1>
            <p class="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Command Center</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-xs font-bold bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
            {{ currentUser?.firstName }} {{ currentUser?.lastName }}
          </span>
          <button (click)="logout()" class="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">
            Logout
          </button>
        </div>
      </header>

      <!-- DRAWER MODAL -->
      <div *ngIf="drawerOpen" class="fixed inset-0 z-50 flex">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="drawerOpen = false"></div>
        <div class="relative w-80 bg-neutral-900 h-full border-r border-neutral-800 shadow-2xl flex flex-col transform transition-transform">
          <div class="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h2 class="font-black text-lg uppercase tracking-tight italic">Menu</h2>
            <button (click)="drawerOpen = false" class="text-neutral-500 hover:text-white">✕</button>
          </div>
          <div class="p-4 space-y-4 flex-1">
            <button (click)="openServicesModal()" class="w-full text-left px-4 py-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl font-bold transition-all text-sm">
              💈 Manage Services
            </button>
            <button class="w-full text-left px-4 py-3 bg-neutral-950 hover:bg-neutral-800 rounded-xl font-bold transition-all text-sm text-neutral-400">
              🔗 Share Link
            </button>
          </div>
        </div>
      </div>

      <main class="max-w-4xl mx-auto p-6 space-y-8">
        
        <!-- STATUS SWITCHER -->
        <section class="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <p class="text-[10px] tracking-widest uppercase font-black text-neutral-500 mb-4 inline-flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" [ngClass]="{'bg-green-500 animate-pulse': currentStatus === 'ACTIVE', 'bg-orange-500': currentStatus === 'FULL', 'bg-neutral-600': currentStatus === 'OFFLINE'}"></span>
            Current Status
          </p>
          
          <div class="flex items-center justify-center p-1 bg-neutral-950 rounded-2xl w-max mx-auto border border-neutral-800/50">
            <button (click)="setStatus('ACTIVE')" 
              class="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              [ngClass]="currentStatus === 'ACTIVE' ? 'bg-green-500 text-black shadow-lg scale-105' : 'text-neutral-500 hover:text-white'">
              ACTIVE
            </button>
            <button (click)="setStatus('FULL')" 
              class="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              [ngClass]="currentStatus === 'FULL' ? 'bg-orange-500 text-black shadow-lg scale-105' : 'text-neutral-500 hover:text-white'">
              FULL
            </button>
            <button (click)="setStatus('OFFLINE')" 
              class="px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              [ngClass]="currentStatus === 'OFFLINE' ? 'bg-neutral-700 text-white shadow-lg scale-105' : 'text-neutral-500 hover:text-white'">
              OFFLINE
            </button>
          </div>
          
          <p *ngIf="currentStatus !== 'OFFLINE'" class="text-xs text-yellow-500 font-bold mt-4 animate-pulse">
            Broadcasting status to clients...
          </p>
        </section>
        <section *ngIf="pendingRequests.length > 0" class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
          <h2 class="text-sm text-yellow-500 font-black uppercase tracking-widest">New Demands ({{pendingRequests.length}})</h2>
        </div>

        <div class="space-y-3">
          <div *ngFor="let req of pendingRequests" class="bg-neutral-900 border-2 border-yellow-500/20 rounded-[1.5rem] p-5 flex items-center justify-between">
            <div>
              <h3 class="font-black text-white uppercase">{{ req.clientName }}</h3>
              <p class="text-[10px] font-bold text-neutral-500">{{ req.serviceNames.join(', ') }}</p>
            </div>
            <div class="flex gap-2">
              <button (click)="rejectRequest(req.id)" class="p-3 bg-red-900/20 text-red-500 rounded-xl hover:bg-red-900/40 transition-all">✕</button>
              <button (click)="acceptRequest(req.id)" class="px-5 py-3 bg-yellow-500 text-black font-black text-[10px] rounded-xl hover:bg-yellow-400 uppercase tracking-widest">Accept</button>
            </div>
          </div>
        </div>
      </section>
        <!-- TODAY'S QUEUE -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">Today's Queue</h2>
            <button (click)="openManualAdd()" class="bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-xl hover:bg-yellow-400 transition-all">
              + Manual Add
            </button>
          </div>

          <div class="flex flex-col gap-4">
            <div *ngIf="activeQueue.length === 0" class="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 text-center text-neutral-500 font-bold text-sm">
              No appointments in the queue.
            </div>

            <div *ngFor="let apt of activeQueue; let i = index; trackBy: trackByAptId" 
                 class="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex items-center justify-between transition-all"
                 [ngClass]="{'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]': i === 0}">
              
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                     [ngClass]="i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30' : 'bg-neutral-950 text-neutral-500 border border-neutral-800'">
                  #{{i + 1}}
                </div>
                <div>
                  <h3 class="font-black uppercase tracking-tighter" [ngClass]="i === 0 ? 'text-white text-xl' : 'text-neutral-300 text-lg'">
                    {{ apt.clientName }}
                  </h3>
                  <p class="text-xs font-bold text-neutral-500 mt-0.5">
                    {{ apt.serviceNames.join(', ') }} • <span class="text-yellow-500">{{ apt.totalDuration }} min</span>
                  </p>
                </div>
              </div>

              <!-- Actions for the first item -->
              <div *ngIf="i === 0">
                <button *ngIf="apt.status === 'WAITING'" (click)="startAppointment(apt.id)"
                  class="bg-green-500 text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl hover:bg-green-400 transition-all">
                  START
                </button>
                <div *ngIf="apt.status === 'IN_PROGRESS'" class="flex items-center gap-3">
                  <span class="text-[10px] font-black text-green-500 animate-pulse uppercase tracking-widest">In Chair...</span>
                  <button (click)="completeAppointment(apt.id)"
                    class="bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all">
                    DONE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- HISTORY -->
        <section class="opacity-70 mt-12">
          <h2 class="text-sm text-neutral-500 font-black uppercase tracking-widest mb-4">Completed Today</h2>
          <div class="space-y-2">
            <div *ngIf="historyQueue.length === 0" class="text-xs font-bold text-neutral-600">No history yet.</div>
            <div *ngFor="let apt of historyQueue" class="bg-neutral-950 border border-neutral-900 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p class="font-bold text-neutral-400 text-sm">{{ apt.clientName }}</p>
                <p class="text-[10px] font-bold text-neutral-600">{{ apt.serviceNames.join(', ') }}</p>
              </div>
              <span class="text-[10px] font-black text-green-500/50 uppercase tracking-widest">COMPLETED</span>
            </div>
          </div>
        </section>

      </main>

      <!-- MANUAL ADD MODAL -->
      <div *ngIf="manualAddOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="manualAddOpen = false"></div>
        <div class="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
          <h2 class="text-2xl font-black italic uppercase tracking-tighter mb-6">Add Appointment</h2>
          
          <div class="overflow-y-auto flex-1 pr-2 -mr-2 space-y-6">
            <!-- Client Search -->
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Search Client / Phone</label>
              <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="onSearchClients($event)" 
                class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500" 
                placeholder="Type name or 10-digit phone...">
              
              <div *ngIf="searchResults.length > 0" class="bg-neutral-950 border border-neutral-800 rounded-xl p-2 mt-2 max-h-40 overflow-y-auto">
                <button *ngFor="let user of searchResults" 
                        (click)="selectUser(user)"
                        class="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-900 transition-colors flex justify-between items-center"
                        [ngClass]="{'bg-neutral-800 border border-yellow-500/30': manualClientId === user.id}">
                  <span class="font-bold text-sm">{{ user.firstName }} {{ user.lastName }}</span>
                  <span class="text-xs text-neutral-500">{{ user.phoneNumber }}</span>
                </button>
              </div>

              <!-- Guest entry -->
              <div class="mt-4 pt-4 border-t border-neutral-800 space-y-2">
                <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Or enter guest name</label>
                <input type="text" [(ngModel)]="manualName" (input)="manualClientId = null; searchQueue = []"
                  class="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-yellow-500" 
                  placeholder="Guest Name">
              </div>
            </div>

            <!-- Service Selection -->
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Select Services</label>
              <div class="space-y-2">
                <label *ngFor="let srv of myServices" 
                       class="flex items-center gap-3 bg-neutral-950 border border-neutral-800 p-3 rounded-xl cursor-pointer hover:border-neutral-600 transition-all"
                       [ngClass]="{'border-yellow-500 bg-yellow-500/5': selectedServiceIds.includes(srv.id)}">
                  <input type="checkbox" [value]="srv.id" (change)="toggleService(srv.id)" class="accent-yellow-500 w-4 h-4">
                  <div class="flex-1">
                    <p class="font-bold text-sm">{{ srv.name }}</p>
                    <p class="text-xs text-neutral-500">{{ srv.duration }}</p>
                  </div>
                  <span class="font-black text-yellow-500 text-sm">{{ srv.price }} DH</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="mt-8 flex gap-3 pt-4 border-t border-neutral-800">
            <button (click)="manualAddOpen = false" class="flex-1 bg-neutral-950 border border-neutral-800 text-neutral-400 font-black uppercase tracking-widest py-3 rounded-xl hover:text-white">Cancel</button>
            <button (click)="submitManualAdd()" class="flex-1 bg-yellow-500 text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">Confirm</button>
          </div>
        </div>
      </div>

      <!-- SERVICES MANAGER MODAL -->
      <div *ngIf="servicesModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" (click)="servicesModalOpen = false"></div>
        <div class="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black italic uppercase tracking-tighter">My Services</h2>
            <button (click)="servicesModalOpen = false" class="text-neutral-500 hover:text-white">✕</button>
          </div>
          
          <div class="overflow-y-auto flex-1 pr-2 -mr-2 space-y-4 mb-6">
            <div *ngIf="myServices.length === 0" class="text-center p-4 text-neutral-500 font-bold text-sm">No services added yet.</div>
            <div *ngFor="let srv of myServices" class="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p class="font-bold text-white">{{ srv.name }}</p>
                <p class="text-xs font-bold text-neutral-500">{{ srv.duration }} • <span class="text-yellow-500">{{ srv.price }} MAD</span></p>
              </div>
              <button (click)="deleteService(srv.id)" class="text-red-500 hover:text-red-400 p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>

          <!-- Add New Service -->
          <div class="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
            <h3 class="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4">Add New Service</h3>
            <div class="space-y-3">
              <input type="text" [(ngModel)]="newServiceName" placeholder="Service Name" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-yellow-500">
              <div class="flex gap-3">
                <input type="number" [(ngModel)]="newServicePrice" placeholder="Price (MAD)" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-yellow-500">
                <input type="number" [(ngModel)]="newServiceDuration" placeholder="Duration (min)" class="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-yellow-500">
              </div>
              <button (click)="addNewService()" class="w-full bg-yellow-500 text-black font-black uppercase tracking-widest text-[10px] py-2 rounded-lg hover:bg-yellow-400 mt-2">
                Add
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `
})
export class BarberDashboard implements OnInit {
  currentStatus: 'ACTIVE' | 'FULL' | 'OFFLINE' = 'OFFLINE';
  currentUser: any;
  activeQueue: AppointmentResponseDTO[] = [];
  historyQueue: AppointmentResponseDTO[] = [];
  
  drawerOpen = false;
  manualAddOpen = false;
  servicesModalOpen = false;

  myServices: ServiceResponseDTO[] = [];
  
  // Manual Add state
  searchQuery = '';
  searchResults: User[] = [];
  manualClientId: number | null = null;
  manualName = '';
  selectedServiceIds: number[] = [];
  searchQueue: any[] = [];

  // New Service state
  newServiceName = '';
  newServicePrice: number | null = null;
  newServiceDuration: number | null = null;
  pendingRequests: AppointmentResponseDTO[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private barberService: BarberService,
    private appointmentService: AppointmentService,
    private catalogService: ServiceCatalogService,
    private ws: WebsocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.ws.connect();
    this.currentUser = this.auth.getCurrentUser();
    this.loadQueue();
    this.loadServices();
    this.loadCurrentStatus();
    this.initWebSocketListener();
  }
  initWebSocketListener() {
    if (this.currentUser && this.currentUser.id) {
      this.ws.subscribeToQueue(this.currentUser.id).subscribe(message => {
        console.log("Signal Received:", message);
        
        // 🔥 Zid had l-Timeout sghir hna
        setTimeout(() => {
          console.log("Refreshing queue now...");
          this.loadQueue(); // Daba l-DB ghadi t-koun dejà updated
        }, 500); // 0.5 saniya kafiwa bach l-backend y-commit-i l-data
      });
    }
  }
  ngOnDestroy() {
    this.ws.disconnect();
  }

  loadCurrentStatus() {
    this.barberService.getCurrentStatus().subscribe({
      next: (status: any) => {
        // Takked beli status katchbah l 'ACTIVE', 'FULL' walla 'OFFLINE'
        
        this.currentStatus = status;
        console.log(this.currentStatus);
      },
      error: (err) => {
        console.error("Ma-qdrnach njibo l-status", err);
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  setStatus(st: 'ACTIVE' | 'FULL' | 'OFFLINE') {
    this.barberService.updateStatus(st).subscribe(() => {
      this.currentStatus = st;
    });
  }

  loadQueue() {
    this.appointmentService.getTodayQueue().subscribe({
      next: (res) => {
        // 1. Demandes li baqi ma-t-acceptawch
        console.log(this.pendingRequests);
        
        this.pendingRequests = res.filter(a => a.status === 'PENDING');
        // Filter l-appointments b7al dima
        this.activeQueue = res.filter(a => a.status === 'WAITING' || a.status === 'IN_PROGRESS');
        this.historyQueue = res.filter(a => a.status === 'COMPLETED');
        
        // 🔥 Zid hadi hna darouri bach t-t-refresh l-UI
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Erreur f loadQueue", err)
    });
  }
  // Zid had l-functions jdad:
  acceptRequest(id: number) {
    this.appointmentService.acceptAppointment(id).subscribe(() => {
      this.loadQueue(); // Refresh kolchi
    });
  }

  rejectRequest(id: number) {
    this.appointmentService.rejectAppointment(id).subscribe(() => {
      this.loadQueue(); // Refresh kolchi
    });
  }

  trackByAptId(index: number, item: AppointmentResponseDTO) {
    return item.id;
  }

  loadServices() {
    this.catalogService.getMyServices().subscribe(res => {
      this.myServices = res;
    });
  }

  startAppointment(id: number) {
    this.appointmentService.startAppointment(id).subscribe(() => {
      this.loadQueue();
    });
  }

  completeAppointment(id: number) {
    this.appointmentService.completeAppointment(id).subscribe(() => {
      this.loadQueue();
    });
  }

  // --- Manual Add Logic ---
  openManualAdd() {
    this.manualAddOpen = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.manualClientId = null;
    this.manualName = '';
    this.selectedServiceIds = [];
  }

  onSearchClients(val: string) {
    if (val.length > 2) {
      this.appointmentService.searchClients(val).subscribe(res => {
        this.searchResults = Array.isArray(res) ? res : [res]; // Wrap if it returns 1 user
      });
    } else {
      this.searchResults = [];
    }
  }

  selectUser(user: User) {
    this.manualClientId = user.id;
    this.manualName = '';
    this.searchQuery = user.firstName + ' ' + user.lastName;
    this.searchResults = [];
  }

  toggleService(id: number) {
    const idx = this.selectedServiceIds.indexOf(id);
    if (idx > -1) {
      this.selectedServiceIds.splice(idx, 1);
    } else {
      this.selectedServiceIds.push(id);
    }
  }

  submitManualAdd() {
    if (this.selectedServiceIds.length === 0) return;
    
    const dto = {
      clientId: this.manualClientId,
      manualName: this.manualName,
      serviceIds: this.selectedServiceIds
    };

    this.appointmentService.createAppointment(dto).subscribe(() => {
      this.manualAddOpen = false;
      this.loadQueue();
    });
  }

  // --- Services Management ---
  openServicesModal() {
    this.servicesModalOpen = true;
    this.drawerOpen = false;
  }

  addNewService() {
    if (!this.newServiceName || !this.newServicePrice || !this.newServiceDuration) return;
    
    this.catalogService.addService({
      name: this.newServiceName,
      price: this.newServicePrice,
      duration: this.newServiceDuration
    }).subscribe(() => {
      this.newServiceName = '';
      this.newServicePrice = null;
      this.newServiceDuration = null;
      this.loadServices();
    });
  }

  deleteService(id: number) {
    this.catalogService.deleteService(id).subscribe(() => {
      this.loadServices();
    });
  }
}
