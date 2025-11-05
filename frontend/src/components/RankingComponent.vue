<template>
    <table>
        <thead>
            <tr>
                <th> Jugadors </th>
                <th> Errors </th>
                <th> Encerts </th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="player in llistatJugadors" :key="player.id">
                <td> {{ player.name }}</td>
                <td> {{ player.errors }}</td>
                <td> {{ player.points }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { computed} from 'vue';

const props = defineProps(['llistaJug']);

const llistatJugadors = computed(() => {
  return props.llistaJug || [];
});


</script>