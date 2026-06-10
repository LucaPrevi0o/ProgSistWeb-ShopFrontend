import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { UserService } from "../../services/user-service";
import { User } from "../../models/user";
import { Observable, of, tap } from "rxjs";
import { HttpState, toHttpState } from "../../app.config";
import { AsyncPipe } from "@angular/common";
import { Router } from "@angular/router";

@Component