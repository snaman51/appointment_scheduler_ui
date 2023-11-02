<template>
  <div>
    <v-card>
    <div class="text-center">
    <v-card-title >Create a Reservation</v-card-title>
  </div>

    <v-divider class="mx-4"></v-divider>

    <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="custom-card"
  >
    <v-text-field
      v-model="title"
      :rules="titleRules"
      :counter="100"
      label="Title"
      required
    ></v-text-field>

    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="E-mail"
      required
    ></v-text-field>

    <v-card-title>
      Select a Date & Time
    </v-card-title>
      <v-chip-group class="text-center">
        <v-chip v-if="Object.keys(dateToTimeRanges).length === 0" :disabled="true">No Slots Available</v-chip>
      <v-chip
        v-for="(timeSlots, date) in dateToTimeRanges"
        :key="date"
        @click="selectDate(date)"
        outlined
        :color="selectedDate === date?'blue-darken-4':'grey'"
      >
        {{ date }}
      </v-chip>
    </v-chip-group>

    <v-chip-group
        v-if="selectedDate"
        column
        class="text-center"
      >
        <v-chip v-for="timeSlot in dateToTimeRanges[selectedDate]" :key="timeSlot"
        @click="selectTime(timeSlot)" 
        outlined
        :color="selectedTime === timeSlot?'blue-darken-4':'grey'">
          {{ timeSlot }}
        </v-chip>
      </v-chip-group >
      <div>
    <v-checkbox v-if="selectedTime" v-model="modifySlot" label="Modify Slot?"></v-checkbox>
      </div>

  <div v-if="this.modifySlot" justify-center>
    <v-row>
<v-col style="max-width: fit-content;">
  <v-text-field type="time" v-model="selectedStartTime" label="Start Time(24h)"></v-text-field>
</v-col>
<v-col style="max-width: fit-content;">
  <v-text-field type="time" v-model="selectedEndTime" label="End Time(24h)"></v-text-field>
</v-col>
</v-row>
  </div>

    <v-row class="justify-center">
      <v-btn
        color="deep-purple lighten-2"
        text
        type="submit"
        @click.prevent="validateTime"
        >
        Reserve
      </v-btn>
    </v-row>
  </v-form>
  </v-card>
  </div>
  <v-dialog v-model="dialogForConfirmation" max-width="400">
      <v-card>
        <v-card-title class="headline">Reservation Confirmation</v-card-title>
        <v-card-text>
          Your reservation has been confirmed.
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialogForConfirmation = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogIncorrectSlot" max-width="400">
      <v-card>
        <v-card-title class="headline">Incorrect Slot Timings</v-card-title>
        <v-card-text>
          Slot Timings selected are incorrect
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialogIncorrectSlot = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<style>
@media (min-width: 1024px) {
  /* .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  } */
  .custom-card {
  padding: 30px;
}
}
</style>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  data() {
    return {
      datetimeString: new Date('2020-10-31T12:00:00'),
      selectedDate: null,
      selectedStartTime: null,
      selectedEndTime: null,
      apiResponse: null,
      dateToTimeRanges:{},
      availableTimeSlots: [],
      selectedTime: null,
      title: null,
      email: null,
      modifySlot: false,
      dialogForConfirmation: false,
      dialogIncorrectSlot: false,
      typingTimer: null,
      typingDelay: 5000,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid',
      ],
      titleRules: [
        v => !!v || 'Title is required',
        v => v.length <= 100 || 'Title must be less than 100 characters',
      ],
    };
  },
  methods: {
    validateTime() {
      console.log("Selected start time", this.selectedStartTime, this.selectedTime)
      console.log("Selected End time", this.selectedEndTime, this.selectedTime)
      if(this.selectedStartTime.split(":")[0]<this.selectedTime.split("-")[0].split(":")[0] || this.selectedStartTime.split(":")[1]<this.selectedTime.split("-")[0].split(":")[1]){
        this.dialogIncorrectSlot = true;
      }
      else if(this.selectedEndTime.split(":")[0]<this.selectedTime.split("-")[1].split(":")[0] || this.selectedEndTime.split(":")[1]<this.selectedTime.split("-")[1].split(":")[1]){
        this.dialogIncorrectSlot = true;
      }
      else{
        this.createReservation()
      }
    },
    createReservation() {
      console.log("Time from selector",this.selectedStartTime, this.selectedEndTime)

      if(this.modifySlot){
        this.selectedStartTime = this.selectedDate+"T"+this.selectedStartTime.trim()+":00.000"
        this.selectedEndTime = this.selectedDate+"T"+this.selectedEndTime.trim()+":00.000"
      }
      else{
      this.selectedStartTime = this.selectedDate+"T"+this.selectedTime.split("-")[0].trim()+":00.000"
      this.selectedEndTime = this.selectedDate+"T"+this.selectedTime.split("-")[1].trim()+":00.000"
    }

      console.log(this.selectedStartTime, this.selectedEndTime, this.email, this.title)

      axios.post('http://localhost:8080/schedule/createreservation', { startTime: this.selectedStartTime, endTime: this.selectedEndTime, email: this.email, title:this.title})
        .then(async(response) => {
          console.log('Response:', response.data);
          console.log('Before loadAvailabilities');
          this.dialogForConfirmation=true;
          await this.loadAvailabilities();
          console.log('After loadAvailabilities');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    },
    async loadAvailabilities() {
      try {
        this.dateToTimeRanges={}
        const response = await axios.get('http://localhost:8080/schedule/listavailabilities');
        // this.apiResponse = response.data

        response.data.forEach(item => {
          const startTime = `${item.startTime[3]}:${String(item.startTime[4]).padStart(2, '0')}`;
          const endTime = `${item.endTime[3]}:${String(item.endTime[4]).padStart(2, '0')}`;

          const date = `${item.startTime[0]}-${String(item.startTime[1]).padStart(2, '0')}-${String(item.startTime[2]).padStart(2, '0')}`;

          if (!this.dateToTimeRanges[date]) {
            this.dateToTimeRanges[date] = [`${startTime}-${endTime}`];
          } else {
            this.dateToTimeRanges[date].push(`${startTime}-${endTime}`);
          }
        });
        
        console.log('API data:', this.dateToTimeRanges);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    selectDate(date) {
      this.selectedDate = date;
      this.selectedTime = null;
    },
    selectTime(time) {
      this.selectedTime = time;
      console.log(this.selectedTime, time)
    }
  
  },
  created(){
    this.loadAvailabilities()
  }
    
};
</script>