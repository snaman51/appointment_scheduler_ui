<template>
  <div>
    <v-card>
    <div class="text-center">
    <v-card-title >Cancel a Reservation</v-card-title>
  </div>

    <v-divider class="mx-4"></v-divider>

    <v-form
    ref="form"
    v-model="valid"
    lazy-validation
    class="custom-card"
  >

    <v-text-field
      v-model="email"
      :rules="emailRules"
      label="E-mail"
      required
      @input="debouncedGetReservedSlots"
    ></v-text-field>

    <v-card-title>
      Select a Date
    </v-card-title>
    <v-card-text>
      <v-chip-group>
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
      >
        <v-chip v-for="timeSlot in dateToTimeRanges[selectedDate]" :key="timeSlot"
        @click="selectTime(timeSlot)" 
        outlined
        :color="selectedTime === timeSlot?'blue-darken-4':'grey'">
          {{ timeSlot }}
        </v-chip>
      </v-chip-group >
    </v-card-text>

    <!-- <v-card-actions class="justify-center"> -->
      <v-row class="justify-center">
      <v-btn
      outlined
        color="secondary"
        text
        type="submit"
        @click.prevent="cancelReservation"
        class="ma-2"
      >
        Cancel Reservation
      </v-btn>
    </v-row>
    <!-- </v-card-actions> -->
  </v-form>
  </v-card>
  </div>
  <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title class="headline">Reservation Cancellation</v-card-title>
        <v-card-text>
          If the email was used for a reservation, it has been canceled.
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="dialog = false">Close</v-btn>
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
import { debounce } from 'lodash';

export default {
  data() {
    return {
      datetimeString: new Date('2020-10-31T12:00:00'),
      selectedDate: new Date(),
      selectedStartTime: null,
      selectedEndTime: null,
      apiResponse: null,
      dateToTimeRanges:{},
      availableTimeSlots: [],
      selectedTime: null,
      title: null,
      email: null,
      checkbox: false,
      dialog: false,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test(v) || 'E-mail must be valid',
      ],
    };
  },
  methods: {
    async getReservedSlots() {
      try {
        this.dateToTimeRanges={}
        const response = await axios.get(`http://localhost:8080/schedule/reservationsbyemail?email=${this.email}`);
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
        
      } catch (error) {
        console.error('Error:', error);
      }
    },

    debouncedGetReservedSlots: debounce(function() {
      this.getReservedSlots();
    }, 500),
    
    cancelReservation() {
      this.selectedStartTime = this.selectedDate+"T"+this.selectedTime.split("-")[0].trim()+":00.000"
      this.selectedEndTime = this.selectedDate+"T"+this.selectedTime.split("-")[1].trim()+":00.000"

      axios.delete('http://localhost:8080/schedule/deletereservation', { data: {startTime: this.selectedStartTime, endTime: this.selectedEndTime, email: this.email}})
        .then(async(response) => {
          this.dialog=true;
          await this.getReservedSlots();
        })
        .catch(error => {
          console.error('Error:', error);
        });

    },
    selectDate(date) {
      this.selectedDate = date;
      this.selectedTime = null;
    },
    selectTime(time) {
      this.selectedTime = time;
    }
  }
    
};
</script>