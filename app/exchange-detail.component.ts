import {Exchange, ErrorCode, ErrorMessage} from "./exchange";
import {ActivatedRoute, Params} from "@angular/router";
import {ExchangeRestClientService} from "./exchange-rest-client.service";
import {OnInit, Component} from "@angular/core";

@Component({
    selector: 'my-exchange-detail',
    templateUrl: 'app/exchange-detail.component.html',
    styleUrls: ['app/exchange-detail.component.css']
})
export class ExchangeDetailComponent implements OnInit {

    exchange: Exchange;
    selectedErrorCode: ErrorCode;
    selectedErrorMessage: ErrorMessage;

    constructor(private exchangeRestClientService: ExchangeRestClientService, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            this.exchangeRestClientService.getExchange(id)
                .then(exchange => this.exchange = exchange);
        });
    }

    goBack(): void {
        window.history.back();
    }

    save(): void {
        this.exchangeRestClientService.update(this.exchange)
            .then(this.goBack);
    }

    onSelectErrorCode(selectedErrorCode: ErrorCode): void {
        this.selectedErrorCode = selectedErrorCode;
    }

    deleteErrorCode(code: ErrorCode): void {
        this.exchange.networkConfig.nonFatalErrorHttpStatusCodes =
            this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.filter(c => c !== code);

        if (this.selectedErrorCode === code) {
            this.selectedErrorCode = null;
        }
    }

    addErrorCode(code: number): void {
        if (!code) {
            return;
        }

        this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.push(new ErrorCode(code));
        this.selectedErrorCode = null;
    }

    onSelectErrorMessage(selectedErrorMessage: ErrorMessage): void {
        this.selectedErrorMessage = selectedErrorMessage;
    }

    deleteErrorMessage(message: ErrorMessage): void {
        this.exchange.networkConfig.nonFatalErrorMessages =
            this.exchange.networkConfig.nonFatalErrorMessages.filter(m => m !== message);

        if (this.selectedErrorMessage === message) {
            this.selectedErrorMessage = null;
        }
    }

    addErrorMessage(message: string): void {
        if (!message) {
            return;
        }

        this.exchange.networkConfig.nonFatalErrorMessages.push(new ErrorMessage(message));
        this.selectedErrorMessage = null;
    }
}

