import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import uuidv4 from 'uuid';

@Component
export default class SpotifyComponent extends Vue {
    baseUrl = 'https://api.spotify.com';
    token: string = '';
    user: any = null;

    mounted() {
        if (this.$route.hash && this.$route.hash.indexOf('token_type=Bearer') >= 0) {
            const hashParams = this.$route.hash
                .slice(1)
                .split('&')
                .map(param => param.split('='))
                .reduce((prev, curr) => ({
                    ...prev,
                    [curr[0]]: curr[1]
                }), {});
            this.token = hashParams['access_token'];
        } else if (this.$route.query && this.$route.query.error) {
            console.error(this.$route.query.error);
        }

        if (this.token) {
            const options: RequestInit = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                mode: 'cors',
                cache: 'default'
            };
            fetch(`${this.baseUrl}/v1/me`, options)
                .then(response => response.json())
                .then(data => {
                    this.user = data;
                    this.user.playlists = [];
                    fetch(`${this.baseUrl}/v1/me/playlists`, options)
                        .then(response => response.json())
                        .then(data => {
                            this.user.playlists.push(...data.items.filter(item => item.owner.id === this.user.id))
                            this.user.playlists.sort((item1, item2) => item1.name.localeCompare(item2.name));
                        });
                });
        }
    }
    
    onLoginClick(): void {
        var client_id = '7d1a7e52b28f4cb89abdb99e9e4405c2'; // Your client id
        var redirect_uri = 'http://localhost:58115/spotify'; // Your redirect uri
        var state = uuidv4();
        localStorage.setItem('spotify_auth_state', state);
        var scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public';
        var url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
        url += '&state=' + encodeURIComponent(state);
        window.location.href = url;
    }
}
