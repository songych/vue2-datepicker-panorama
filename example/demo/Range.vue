<template>
  <div class="box">
    <section>
      <p>date range</p>
      <date-picker v-model="value1" type="date" range placeholder="Select date range"></date-picker>
    </section>
    <section>
      <p>month range</p>
      <date-picker v-model="value2" type="month" range placeholder="Select month range"></date-picker>
    </section>
    <section>
      <p>quarter range</p>
      <date-picker v-model="value3" type="quarter" range placeholder="Select quarter range"></date-picker>
    </section>
    <section>
      <p>datetime range</p>
      <date-picker
        v-model="value2"
        type="datetime"
        range
        placeholder="Select datetime range"
      ></date-picker>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Range',
  data() {
    return {
      value1: [new Date(2019, 9, 8), new Date(2019, 9, 19)],
      value2: [],
      value3: [new Date(), new Date()],
    };
  },
};
</script>
